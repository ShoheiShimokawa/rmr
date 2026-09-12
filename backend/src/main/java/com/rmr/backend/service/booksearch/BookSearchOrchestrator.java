package com.rmr.backend.service.booksearch;

import java.text.Normalizer;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.function.Supplier;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;

/**
 * クエリを正規化し、日本語クエリはNDLサーチ、それ以外はGoogle Booksを優先して検索する。
 * 優先プロバイダの結果が空または失敗した場合のみ、もう一方にフォールバックする。
 *
 * <p>日本語クエリでは、NDLサーチが一定時間(hedge delay)内に返らない場合にGoogle Booksを並行して開始し、
 * NDLサーチが時間予算内に結果を返せばそれを、返せなければ先に得たGoogle Booksの結果を待たずに返す。
 * NDLサーチの結果には openBD(書影・内容紹介) と Google Books Dynamic Links(書影) を並列に問い合わせて補完し、
 * 結果を正規化クエリ単位で一定時間キャッシュする(フォールバック結果は短めの期限)。
 */
@Service
public class BookSearchOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(BookSearchOrchestrator.class);
    private static final int CACHE_MAX_ENTRIES = 500;
    private static final Duration CACHE_TTL = Duration.ofHours(1);
    private static final Duration FALLBACK_CACHE_TTL = Duration.ofMinutes(10);

    private final BookSearchProvider ndlProvider;
    private final BookSearchProvider googleBooksProvider;
    private final OpenBdClient openBdClient;
    private final GoogleBooksCoverClient googleBooksCoverClient;
    private final Executor executor;
    private final long hedgeDelayMillis;
    private final ResultCache cache = new ResultCache();

    public BookSearchOrchestrator(
            @Qualifier("ndlSearchProvider") BookSearchProvider ndlProvider,
            @Qualifier("googleBooksProvider") BookSearchProvider googleBooksProvider,
            OpenBdClient openBdClient,
            GoogleBooksCoverClient googleBooksCoverClient,
            @Qualifier("applicationTaskExecutor") Executor executor,
            @Value("${booksearch.hedge-delay-ms}") long hedgeDelayMillis) {
        this.ndlProvider = ndlProvider;
        this.googleBooksProvider = googleBooksProvider;
        this.openBdClient = openBdClient;
        this.googleBooksCoverClient = googleBooksCoverClient;
        this.executor = executor;
        this.hedgeDelayMillis = hedgeDelayMillis;
    }

    public List<BookSearchResult> search(String rawQuery, BookSearchContext context) {
        String query = normalize(rawQuery);
        if (!shouldPreferNdl(query, context)) {
            List<BookSearchResult> results = safeSearch(googleBooksProvider, query, context);
            if (results.isEmpty()) {
                results = safeSearch(ndlProvider, query, context);
                if (!results.isEmpty()) {
                    results = enrich(results);
                }
            }
            return results;
        }

        List<BookSearchResult> cached = cache.get(query);
        if (cached != null) {
            return cached;
        }

        CompletableFuture<List<BookSearchResult>> ndlFuture = searchAsync(ndlProvider, query, context);
        CompletableFuture<List<BookSearchResult>> googleFuture = null;
        List<BookSearchResult> ndlResults = awaitUpTo(ndlFuture, hedgeDelayMillis);
        if (ndlResults == null) {
            googleFuture = searchAsync(googleBooksProvider, query, context);
            ndlResults = ndlFuture.join();
        }

        if (!ndlResults.isEmpty()) {
            List<BookSearchResult> enriched = enrich(ndlResults);
            cache.put(query, enriched, CACHE_TTL);
            return enriched;
        }
        List<BookSearchResult> googleResults = googleFuture != null
                ? googleFuture.join()
                : safeSearch(googleBooksProvider, query, context);
        if (!googleResults.isEmpty()) {
            cache.put(query, googleResults, FALLBACK_CACHE_TTL);
        }
        return googleResults;
    }

    private CompletableFuture<List<BookSearchResult>> searchAsync(
            BookSearchProvider provider, String query, BookSearchContext context) {
        return CompletableFuture.supplyAsync(() -> safeSearch(provider, query, context), executor)
                .exceptionally(e -> {
                    log.warn("book search provider failed unexpectedly: {}", provider.getClass().getSimpleName(), e);
                    return List.of();
                });
    }

    /** 指定時間だけ完了を待つ。時間内に完了しなければnullを返し、処理自体は継続させる。 */
    private List<BookSearchResult> awaitUpTo(CompletableFuture<List<BookSearchResult>> future, long millis) {
        try {
            return future.get(millis, TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            return null;
        } catch (ExecutionException e) {
            return List.of();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return List.of();
        }
    }

    /** クエリ文字列に日本語が含まれるかを最優先のシグナルとし、次点でlanguageHintを見る。 */
    private boolean shouldPreferNdl(String query, BookSearchContext context) {
        if (JapaneseTextUtils.containsJapanese(query)) {
            return true;
        }
        return context != null && "ja".equalsIgnoreCase(context.languageHint());
    }

    /** HTTPレベルの例外(タイムアウト・接続失敗等)を吸収し、検索全体を失敗させない。 */
    private List<BookSearchResult> safeSearch(BookSearchProvider provider, String query, BookSearchContext context) {
        try {
            List<BookSearchResult> results = provider.search(query, context);
            return results != null ? results : List.of();
        } catch (RestClientException e) {
            log.warn("book search provider failed: {}", provider.getClass().getSimpleName(), e);
            return List.of();
        }
    }

    /** ISBNをまとめて openBD と Google Books に並列に問い合わせ、書影は openBD を優先、内容紹介は openBD で補完する。 */
    private List<BookSearchResult> enrich(List<BookSearchResult> results) {
        List<String> isbns = results.stream()
                .filter(result -> result.thumbnail() == null || result.description() == null)
                .map(BookSearchResult::isbn)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        if (isbns.isEmpty()) {
            return results;
        }

        CompletableFuture<Map<String, OpenBdClient.OpenBdBook>> openBdFuture =
                CompletableFuture.supplyAsync(() -> safeFetch(() -> openBdClient.fetchBooks(isbns), "openBD"), executor);
        CompletableFuture<Map<String, String>> googleFuture =
                CompletableFuture.supplyAsync(() -> safeFetch(() -> googleBooksCoverClient.fetchThumbnails(isbns), "Google Books"), executor);

        Map<String, String> thumbnails = new HashMap<>(googleFuture.join());
        Map<String, String> descriptions = new HashMap<>();
        openBdFuture.join().forEach((isbn, book) -> {
            if (book.cover() != null) {
                thumbnails.put(isbn, book.cover());
            }
            if (book.description() != null) {
                descriptions.put(isbn, book.description());
            }
        });
        if (thumbnails.isEmpty() && descriptions.isEmpty()) {
            return results;
        }

        List<BookSearchResult> enriched = new ArrayList<>(results.size());
        for (BookSearchResult result : results) {
            BookSearchResult updated = result;
            if (result.isbn() != null) {
                if (updated.thumbnail() == null && thumbnails.containsKey(result.isbn())) {
                    updated = updated.withThumbnail(thumbnails.get(result.isbn()));
                }
                if (updated.description() == null && descriptions.containsKey(result.isbn())) {
                    updated = updated.withDescription(descriptions.get(result.isbn()));
                }
            }
            enriched.add(updated);
        }
        return enriched;
    }

    private <T> Map<String, T> safeFetch(Supplier<Map<String, T>> source, String sourceName) {
        try {
            Map<String, T> fetched = source.get();
            return fetched != null ? fetched : Map.of();
        } catch (RestClientException e) {
            log.warn("{} lookup failed", sourceName, e);
            return Map.of();
        }
    }

    /** 全角/半角の表記ゆれを吸収するためNFKC正規化する。 */
    private String normalize(String query) {
        if (!StringUtils.hasText(query)) {
            return query;
        }
        return Normalizer.normalize(query, Normalizer.Form.NFKC);
    }

    /** 正規化クエリをキーとする、有効期限付きのLRUキャッシュ。 */
    private static final class ResultCache {
        private record Entry(List<BookSearchResult> results, long expiresAt) {
        }

        private final Map<String, Entry> entries = new LinkedHashMap<>(64, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<String, Entry> eldest) {
                return size() > CACHE_MAX_ENTRIES;
            }
        };

        synchronized List<BookSearchResult> get(String key) {
            Entry entry = entries.get(key);
            if (entry == null) {
                return null;
            }
            if (System.nanoTime() > entry.expiresAt()) {
                entries.remove(key);
                return null;
            }
            return entry.results();
        }

        synchronized void put(String key, List<BookSearchResult> results, Duration ttl) {
            entries.put(key, new Entry(List.copyOf(results), System.nanoTime() + ttl.toNanos()));
        }
    }
}
