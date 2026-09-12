package com.rmr.backend.service.booksearch;

import java.io.StringReader;
import java.net.URI;
import java.text.Normalizer;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executor;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.xml.XMLConstants;
import javax.xml.namespace.NamespaceContext;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

/**
 * 国立国会図書館サーチ(NDLサーチ) SRU APIを呼び出す書籍検索プロバイダ。
 * dpid=jpro(出版情報登録センターの市販書籍データ)を対象に、onlyBib=true で書誌情報のみを取得する。
 *
 * <p>NDLサーチには関連度順ソートが無くタイトル順で返るため、次の順で直列に問い合わせ、
 * 取得した候補を自前のスコアで並べ替える。
 * <ol>
 * <li>title 検索(1ページ)。完全一致/前方一致があればここで終了</li>
 * <li>無ければ creator 検索(著者名クエリ)</li>
 * <li>creator も空で title の総件数が1ページ超〜上限内なら、title の残りページ</li>
 * <li>すべて空なら anywhere 検索</li>
 * </ol>
 * NDLサーチは同時リクエスト数を制限しているため、アプリ全体の同時接続数を Semaphore で抑える。
 * 1検索あたりの合計時間には上限(time budget)を設け、超過した場合は追加の問い合わせを打ち切って
 * 手元の候補で結果を返す(最初の問い合わせが超過した場合は失敗として呼び出し元に委ねる)。
 */
@Component
public class NdlSearchProvider implements BookSearchProvider {

    private static final String PROVIDER_NAME = "NDL_SEARCH";
    private static final String SRW_NS = "http://www.loc.gov/zing/srw/";
    private static final String RDF_NS = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
    private static final String DC_NS = "http://purl.org/dc/elements/1.1/";
    private static final String DCTERMS_NS = "http://purl.org/dc/terms/";
    private static final String DCNDL_NS = "http://ndl.go.jp/dcndl/terms/";
    private static final String FOAF_NS = "http://xmlns.com/foaf/0.1/";
    private static final String ISBN_DATATYPE = "http://ndl.go.jp/dcndl/terms/ISBN";

    private static final Logger log = LoggerFactory.getLogger(NdlSearchProvider.class);

    private static final int PAGE_SIZE = 40;
    private static final int HUNT_LIMIT = 150;
    /** 著者名クエリとみなす正規化後の最大文字数。これより長いクエリは書名とみなし creator 検索を省略する。 */
    private static final int MAX_AUTHOR_QUERY_LENGTH = 12;
    private static final long PERMIT_WAIT_MILLIS = 3000;

    private static final Pattern NORMALIZE_STRIP = Pattern.compile("[\\s\\p{P}\\p{S}]+");
    private static final Pattern SUBTITLE_SEPARATOR = Pattern.compile("\\s[:：]\\s");
    private static final Pattern YEAR = Pattern.compile("(\\d{4})");
    private static final Pattern NDC_CLASS = Pattern.compile("/class/ndc(\\d*)/([0-9.]+)$");
    private static final Map<String, String> LANGUAGE_CODES = Map.ofEntries(
            Map.entry("ja", "ja"), Map.entry("jpn", "ja"),
            Map.entry("en", "en"), Map.entry("eng", "en"),
            Map.entry("zh", "zh"), Map.entry("chi", "zh"), Map.entry("zho", "zh"),
            Map.entry("ko", "ko"), Map.entry("kor", "ko"),
            Map.entry("fr", "fr"), Map.entry("fre", "fr"), Map.entry("fra", "fr"),
            Map.entry("de", "de"), Map.entry("ger", "de"), Map.entry("deu", "de"));

    private final RestTemplate restTemplate;
    private final Executor executor;
    private final String ndlSearchApiUrl;
    private final int maxRecords;
    private final long timeBudgetNanos;
    private final Semaphore permits;

    public NdlSearchProvider(
            RestTemplate restTemplate,
            @Qualifier("applicationTaskExecutor") Executor executor,
            @Value("${ndl.search.api.url}") String ndlSearchApiUrl,
            @Value("${ndl.search.max-records}") int maxRecords,
            @Value("${ndl.search.max-concurrent-requests}") int maxConcurrentRequests,
            @Value("${ndl.search.time-budget-ms}") long timeBudgetMillis) {
        this.restTemplate = restTemplate;
        this.executor = executor;
        this.ndlSearchApiUrl = ndlSearchApiUrl;
        this.maxRecords = maxRecords;
        this.timeBudgetNanos = Duration.ofMillis(timeBudgetMillis).toNanos();
        this.permits = new Semaphore(maxConcurrentRequests);
    }

    @Override
    public List<BookSearchResult> search(String query, BookSearchContext context) {
        if (!StringUtils.hasText(query)) {
            return List.of();
        }
        long deadline = System.nanoTime() + timeBudgetNanos;
        String normalizedQuery = normalize(query);

        SruPage titlePage = fetchWithin(cql("title", query), PAGE_SIZE, 1, deadline)
                .orElseThrow(() -> new ResourceAccessException("NDL Search did not respond within the time budget"));
        List<NdlRecord> candidates = new ArrayList<>(titlePage.records());

        boolean looksLikeAuthorQuery = normalizedQuery.length() <= MAX_AUTHOR_QUERY_LENGTH;
        if (!hasPrefixMatch(titlePage.records(), normalizedQuery) && looksLikeAuthorQuery) {
            Optional<SruPage> creatorPage = fetchWithin(cql("creator", query), PAGE_SIZE, 1, deadline);
            creatorPage.ifPresent(page -> candidates.addAll(page.records()));
            boolean creatorEmpty = creatorPage.map(page -> page.records().isEmpty()).orElse(false);
            boolean titleOverflowed = titlePage.total() > PAGE_SIZE && titlePage.total() <= HUNT_LIMIT;
            if (creatorEmpty && titleOverflowed) {
                fetchWithin(cql("title", query), titlePage.total() - PAGE_SIZE, PAGE_SIZE + 1, deadline)
                        .ifPresent(page -> candidates.addAll(page.records()));
            }
        }
        if (candidates.isEmpty()) {
            fetchWithin(cql("anywhere", query), PAGE_SIZE, 1, deadline)
                    .ifPresent(page -> candidates.addAll(page.records()));
        }

        return dedupe(candidates).stream()
                .sorted(Comparator.comparingDouble((NdlRecord record) -> score(record, normalizedQuery)).reversed())
                .limit(maxRecords)
                .map(this::toResult)
                .toList();
    }

    /**
     * 残り時間の範囲内で問い合わせる。時間切れなら空を返し、進行中のHTTP呼び出しは
     * 自身のタイムアウトまでバックグラウンドで終了させる(結果は捨てる)。
     */
    private Optional<SruPage> fetchWithin(String cql, int maximumRecords, int startRecord, long deadline) {
        long remaining = deadline - System.nanoTime();
        if (remaining <= 0) {
            return Optional.empty();
        }
        CompletableFuture<SruPage> future =
                CompletableFuture.supplyAsync(() -> fetch(cql, maximumRecords, startRecord), executor);
        try {
            return Optional.of(future.get(remaining, TimeUnit.NANOSECONDS));
        } catch (TimeoutException e) {
            log.warn("NDL Search time budget exceeded for query: {}", cql);
            return Optional.empty();
        } catch (ExecutionException e) {
            if (e.getCause() instanceof RestClientException cause) {
                throw cause;
            }
            throw new ResourceAccessException("NDL Search request failed: " + e.getCause());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResourceAccessException("interrupted while waiting for NDL Search");
        }
    }

    /** NDLサーチのCQLは and/or の混在と丸括弧に対応していないため、"項目=値 and dpid=jpro" の形に限定する。 */
    private String cql(String field, String query) {
        String escaped = query.replace("\"", "\\\"");
        return field + "=\"" + escaped + "\" and dpid=jpro";
    }

    private SruPage fetch(String cql, int maximumRecords, int startRecord) {
        URI url = UriComponentsBuilder.fromHttpUrl(ndlSearchApiUrl)
                .queryParam("operation", "searchRetrieve")
                .queryParam("version", "1.2")
                .queryParam("recordSchema", "dcndl")
                .queryParam("recordPacking", "xml")
                .queryParam("onlyBib", "true")
                .queryParam("maximumRecords", maximumRecords)
                .queryParam("startRecord", startRecord)
                .queryParam("query", cql)
                .build()
                .encode()
                .toUri();

        String rawBody;
        acquirePermit();
        try {
            rawBody = restTemplate.getForObject(url, String.class);
        } finally {
            permits.release();
        }
        return parse(rawBody);
    }

    private void acquirePermit() {
        boolean acquired;
        try {
            acquired = permits.tryAcquire(PERMIT_WAIT_MILLIS, TimeUnit.MILLISECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResourceAccessException("interrupted while waiting for NDL Search permit");
        }
        if (!acquired) {
            throw new ResourceAccessException("NDL Search concurrent request limit reached");
        }
    }

    private SruPage parse(String rawBody) {
        if (!StringUtils.hasText(rawBody)) {
            return SruPage.EMPTY;
        }
        Document doc;
        try {
            doc = newSecureDocumentBuilder().parse(new InputSource(new StringReader(rawBody)));
        } catch (Exception e) {
            return SruPage.EMPTY;
        }

        XPath xpath = XPathFactory.newInstance().newXPath();
        xpath.setNamespaceContext(new DcndlNamespaceContext());
        try {
            int total = parseIntOrZero(xpath.evaluate("/srw:searchRetrieveResponse/srw:numberOfRecords", doc));
            // 所蔵館一覧だけを持つdcndl:BibResourceを除外するため、dcterms:titleを持つものに絞る。
            NodeList bibResources = (NodeList) xpath.evaluate(
                    "//srw:recordData/rdf:RDF/dcndl:BibResource[dcterms:title]", doc, XPathConstants.NODESET);
            List<NdlRecord> records = new ArrayList<>();
            for (int i = 0; i < bibResources.getLength(); i++) {
                records.add(toRecord((Element) bibResources.item(i), xpath));
            }
            return new SruPage(records, total);
        } catch (Exception e) {
            return SruPage.EMPTY;
        }
    }

    private NdlRecord toRecord(Element bibResource, XPath xpath) throws Exception {
        String publishedDate = textOf(xpath, bibResource, "dcterms:issued[1]");
        if (!StringUtils.hasText(publishedDate)) {
            publishedDate = textOf(xpath, bibResource, "dcterms:date[1]");
        }
        String rawIsbn = textOf(xpath, bibResource,
                "dcterms:identifier[@rdf:datatype='" + ISBN_DATATYPE + "'][1]");
        String statement = textOf(xpath, bibResource, "dc:creator[1]");
        String author = NdlAuthorNames.fromAuthorityName(
                textOf(xpath, bibResource, "dcterms:creator[1]/foaf:Agent/foaf:name[1]"));
        if (author == null) {
            author = NdlAuthorNames.fromStatement(statement);
        }
        return new NdlRecord(
                bibResource.getAttributeNS(RDF_NS, "about"),
                StringUtils.hasText(rawIsbn) ? IsbnUtils.toIsbn13(rawIsbn) : null,
                textOf(xpath, bibResource, "dcterms:title[1]"),
                textOf(xpath, bibResource, "dc:title/rdf:Description/dcndl:transcription[1]"),
                author,
                NdlAuthorNames.readingFromTranscription(
                        textOf(xpath, bibResource, "dcterms:creator[1]/foaf:Agent/dcndl:transcription[1]")),
                statement,
                publishedDate,
                toLanguageCode(textOf(xpath, bibResource, "dcterms:language[1]")),
                extractNdc(xpath, bibResource));
    }

    /** dcterms:subject の rdf:resource からNDC分類記号を取り出す。複数ある場合は新しい版(ndc10 > ndc9 ...)を優先する。 */
    private String extractNdc(XPath xpath, Element bibResource) throws Exception {
        NodeList subjects = (NodeList) xpath.evaluate("dcterms:subject/@rdf:resource", bibResource, XPathConstants.NODESET);
        String best = null;
        int bestEdition = -1;
        for (int i = 0; i < subjects.getLength(); i++) {
            Matcher matcher = NDC_CLASS.matcher(subjects.item(i).getNodeValue());
            if (!matcher.find()) {
                continue;
            }
            int edition = matcher.group(1).isEmpty() ? 0 : Integer.parseInt(matcher.group(1));
            if (edition > bestEdition) {
                bestEdition = edition;
                best = matcher.group(2);
            }
        }
        if (best == null) {
            best = textOf(xpath, bibResource, "dc:subject[contains(@rdf:datatype, 'NDC')][1]");
        }
        return best;
    }

    private BookSearchResult toResult(NdlRecord record) {
        return new BookSearchResult(
                PROVIDER_NAME,
                StringUtils.hasText(record.sourceId()) ? record.sourceId() : null,
                record.isbn(),
                record.title(),
                record.titleKana(),
                record.author(),
                record.authorKana(),
                null,   // description: 検索後にopenBDで補完する
                null,   // thumbnail: 検索後に書影補完で設定する
                record.publishedDate(),
                NdcGenreMapper.toGenreLabel(record.ndc()),
                record.language());
    }

    private double score(NdlRecord record, String normalizedQuery) {
        String title = normalize(record.title());
        String mainTitle = normalize(mainTitle(record.title()));
        double score = 0;
        if (title.equals(normalizedQuery) || mainTitle.equals(normalizedQuery)) {
            score += 100;
        } else if (title.startsWith(normalizedQuery)) {
            score += 60;
        } else if (mainTitle.contains(normalizedQuery)) {
            score += 45 + titleLengthBonus(mainTitle, normalizedQuery);
        } else if (title.contains(normalizedQuery)) {
            score += 35;
        }
        if (normalize(record.authorStatement()).contains(normalizedQuery)
                || normalize(record.author()).contains(normalizedQuery)) {
            score += 50;
        }
        if (record.isbn() != null) {
            score += 10;
        }
        if (record.language() != null && !"ja".equals(record.language())) {
            score -= 50;
        }
        score += yearBonus(record.publishedDate());
        return score;
    }

    /** 主題名がクエリに近い長さほど僅かに加点する(0〜5点)。主題名の部分一致同士では、余計な語の少ない本を先に出す。 */
    private double titleLengthBonus(String normalizedMainTitle, String normalizedQuery) {
        int extra = Math.max(normalizedMainTitle.length() - normalizedQuery.length(), 0);
        return Math.max(0, 5 - extra / 4.0);
    }

    /** 刊行年が新しいほど僅かに加点する(0〜5点)。同じ本の版違いで新しい方を先に出すためのタイブレーク。 */
    private double yearBonus(String publishedDate) {
        if (publishedDate == null) {
            return 0;
        }
        Matcher matcher = YEAR.matcher(publishedDate);
        if (!matcher.find()) {
            return 0;
        }
        int year = Integer.parseInt(matcher.group(1));
        return Math.min(Math.max(year - 1900, 0), 125) / 25.0;
    }

    private boolean hasPrefixMatch(List<NdlRecord> records, String normalizedQuery) {
        return records.stream().anyMatch(record -> normalize(record.title()).startsWith(normalizedQuery));
    }

    private List<NdlRecord> dedupe(List<NdlRecord> records) {
        Set<String> seen = new HashSet<>();
        List<NdlRecord> unique = new ArrayList<>();
        for (NdlRecord record : records) {
            String key = record.isbn() != null ? "isbn:" + record.isbn() : "id:" + record.sourceId();
            if (seen.add(key)) {
                unique.add(record);
            }
        }
        return unique;
    }

    /** NFKC正規化し、空白・記号を除いて小文字化する(表記ゆれを吸収した比較用)。 */
    private static String normalize(String text) {
        if (text == null) {
            return "";
        }
        String nfkc = Normalizer.normalize(text, Normalizer.Form.NFKC);
        return NORMALIZE_STRIP.matcher(nfkc).replaceAll("").toLowerCase();
    }

    /** "本タイトル : 副題" 形式から本タイトル部分を返す。 */
    private static String mainTitle(String title) {
        return title == null ? "" : SUBTITLE_SEPARATOR.split(title, 2)[0];
    }

    private static String toLanguageCode(String language) {
        if (!StringUtils.hasText(language)) {
            return null;
        }
        return LANGUAGE_CODES.get(language.trim().toLowerCase());
    }

    private static int parseIntOrZero(String text) {
        try {
            return Integer.parseInt(text.trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private String textOf(XPath xpath, Element context, String expression) throws Exception {
        Node node = (Node) xpath.evaluate(expression, context, XPathConstants.NODE);
        if (node == null) {
            return null;
        }
        String text = node.getTextContent();
        return StringUtils.hasText(text) ? text.trim() : null;
    }

    /** 呼び出しごとに生成する。DocumentBuilderはスレッド非安全なため使い回さない。 */
    private DocumentBuilder newSecureDocumentBuilder() throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        // XXE(XML外部実体参照)対策。外部から取得したXMLを解析するため必須。
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
        factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        factory.setXIncludeAware(false);
        factory.setExpandEntityReferences(false);
        return factory.newDocumentBuilder();
    }

    /** SRUレスポンス1ページ分。totalは検索条件全体のヒット件数。 */
    private record SruPage(List<NdlRecord> records, int total) {
        static final SruPage EMPTY = new SruPage(List.of(), 0);
    }

    /** authorは表示用の先頭1名、authorStatementは全著者を含む責任表示(検索一致の判定用)。 */
    private record NdlRecord(
            String sourceId,
            String isbn,
            String title,
            String titleKana,
            String author,
            String authorKana,
            String authorStatement,
            String publishedDate,
            String language,
            String ndc) {
    }

    /** dcndlレスポンスで使われる名前空間prefixとURIの対応。 */
    private static final class DcndlNamespaceContext implements NamespaceContext {
        private static final Map<String, String> PREFIX_TO_URI = new HashMap<>();

        static {
            PREFIX_TO_URI.put("srw", SRW_NS);
            PREFIX_TO_URI.put("rdf", RDF_NS);
            PREFIX_TO_URI.put("dc", DC_NS);
            PREFIX_TO_URI.put("dcterms", DCTERMS_NS);
            PREFIX_TO_URI.put("dcndl", DCNDL_NS);
            PREFIX_TO_URI.put("foaf", FOAF_NS);
        }

        @Override
        public String getNamespaceURI(String prefix) {
            return PREFIX_TO_URI.getOrDefault(prefix, XMLConstants.NULL_NS_URI);
        }

        @Override
        public String getPrefix(String namespaceURI) {
            return null;
        }

        @Override
        public Iterator<String> getPrefixes(String namespaceURI) {
            return null;
        }
    }
}
