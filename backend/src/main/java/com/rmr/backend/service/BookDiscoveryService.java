package com.rmr.backend.service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.rmr.backend.context.BookRepository;
import com.rmr.backend.context.PostRepository;
import com.rmr.backend.context.ReadingRepository;
import com.rmr.backend.model.Account;
import com.rmr.backend.model.Book;
import com.rmr.backend.model.Reading;
import com.rmr.backend.model.Reading.ActivityRow;
import com.rmr.backend.service.booksearch.BookMatchKeys;
import com.rmr.backend.type.BookStatusType;
import com.rmr.backend.type.FollowStatusType;
import com.rmr.backend.type.PostType;

import lombok.RequiredArgsConstructor;

/**
 * /bookページの発見セクション(評価の高い本・今読まれている本・フォロー中の人の本)を計算する。
 *
 * <p>同じ本が複数のBook行(NDL由来・Google由来など)に分かれていることがあるため、ISBNまたは
 * タイトル+著者で束ねてから集計する。評価の高い本・今読まれている本は{@link #snapshot()}が
 * 一度のクエリ実行でまとめて計算し、一定時間メモリにキャッシュする。
 */
@Service
@RequiredArgsConstructor
public class BookDiscoveryService {

    static final int RANKING_LIMIT = 20;
    static final int FOLLOWING_LIMIT = 20;
    static final int FOLLOWING_FETCH_LIMIT = 100;
    static final int FOLLOWING_READER_LIMIT = 5;
    static final int HIGH_RATING_THRESHOLD = 4;
    static final int RECOMMEND_ASSUMED_RATE = 5;
    static final int RECOMMEND_VOTE_WEIGHT = 2;
    static final int RECOMMEND_POPULARITY_BONUS = 2;
    static final double MIN_AVERAGE_RATING_TO_LIST = 3.5;
    static final double DEFAULT_GLOBAL_AVERAGE = 3.5;
    static final int BAYESIAN_MIN_VOTES = 3;
    static final double POPULARITY_HALF_LIFE_DAYS = 30.0;

    private static final Duration SNAPSHOT_CACHE_TTL = Duration.ofMinutes(10);

    private final ReadingRepository readingRepository;
    private final BookRepository bookRepository;
    private final PostRepository postRepository;

    private volatile Snapshot cachedSnapshot;

    /** ★とRecommendのベイズ平均で評価の高い本を返します。 */
    public List<Book.Ranked> topRated() {
        return snapshot().topRated();
    }

    /** 直近のアクティビティを重視した、今読まれている本を返します。 */
    public List<Book.Ranked> popular() {
        return snapshot().popular();
    }

    /** フォロー中の人が最近読んでいる本を返します。未ログイン(viewerIdがnull)なら空を返します。 */
    public List<Book.FollowingActivity> following(Integer viewerId) {
        if (viewerId == null) {
            return List.of();
        }
        List<Reading> recent = readingRepository.findRecentByFollowedUsers(viewerId, FollowStatusType.VALID,
                BookStatusType.INVALID, PageRequest.of(0, FOLLOWING_FETCH_LIMIT));
        return groupFollowing(recent, FOLLOWING_LIMIT, FOLLOWING_READER_LIMIT);
    }

    /** 評価の高い本・今読まれている本をまとめて計算し、一定時間キャッシュする。 */
    private Snapshot snapshot() {
        Snapshot snapshot = cachedSnapshot;
        Instant now = Instant.now();
        if (snapshot != null && snapshot.expiresAt().isAfter(now)) {
            return snapshot;
        }
        synchronized (this) {
            snapshot = cachedSnapshot;
            if (snapshot != null && snapshot.expiresAt().isAfter(now)) {
                return snapshot;
            }
            List<ActivityRow> rows = readingRepository.findActivityRows();
            Set<Integer> recommendedReadingIds = new HashSet<>(
                    postRepository.findReadingIdsByPostType(PostType.RECOMMENDED));
            snapshot = computeSnapshot(rows, recommendedReadingIds, now);
            cachedSnapshot = snapshot;
            return snapshot;
        }
    }

    private Snapshot computeSnapshot(List<ActivityRow> rows, Set<Integer> recommendedReadingIds, Instant now) {
        Map<String, List<ActivityRow>> groups = groupByWorkKey(rows);
        List<GroupStats> stats = new ArrayList<>(groups.size());
        for (Map.Entry<String, List<ActivityRow>> entry : groups.entrySet()) {
            stats.add(computeGroupStats(entry.getKey(), entry.getValue(), recommendedReadingIds, now));
        }

        double globalAverage = globalAverageRating(stats);
        List<RankedGroup> topRatedGroups = rankTopRated(stats, globalAverage, RANKING_LIMIT);
        List<RankedGroup> popularGroups = rankPopular(stats, RANKING_LIMIT);

        Set<Integer> bookIdsToLoad = new HashSet<>();
        topRatedGroups.forEach(g -> bookIdsToLoad.add(g.stats().representativeBookId()));
        popularGroups.forEach(g -> bookIdsToLoad.add(g.stats().representativeBookId()));
        Map<Integer, Book> booksById = new HashMap<>();
        bookRepository.findAllById(bookIdsToLoad).forEach(b -> booksById.put(b.getBookId(), b));

        List<Book.Ranked> topRated = toRanked(topRatedGroups, booksById);
        List<Book.Ranked> popular = toRanked(popularGroups, booksById);
        return new Snapshot(topRated, popular, now.plus(SNAPSHOT_CACHE_TTL));
    }

    private List<Book.Ranked> toRanked(List<RankedGroup> groups, Map<Integer, Book> booksById) {
        List<Book.Ranked> result = new ArrayList<>(groups.size());
        for (RankedGroup group : groups) {
            Book book = booksById.get(group.stats().representativeBookId());
            if (book == null) {
                continue;
            }
            result.add(new Book.Ranked(book, group.stats().readerCount(), group.stats().averageRating(),
                    group.stats().ratingCount(), group.stats().recommendCount()));
        }
        return result;
    }

    /** ISBNがあればISBNで、無ければタイトル+著者で、本の行を束ねる。 */
    static Map<String, List<ActivityRow>> groupByWorkKey(List<ActivityRow> rows) {
        Map<String, String> isbnKeyByTitleAuthor = new HashMap<>();
        for (ActivityRow row : rows) {
            String isbnKey = BookMatchKeys.isbnKey(row.isbn());
            if (isbnKey != null) {
                String titleAuthorKey = BookMatchKeys.titleAuthorKey(row.title(), row.author());
                if (titleAuthorKey != null) {
                    isbnKeyByTitleAuthor.putIfAbsent(titleAuthorKey, isbnKey);
                }
            }
        }

        Map<String, List<ActivityRow>> groups = new LinkedHashMap<>();
        for (ActivityRow row : rows) {
            String key = workKey(row, isbnKeyByTitleAuthor);
            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(row);
        }
        return groups;
    }

    private static String workKey(ActivityRow row, Map<String, String> isbnKeyByTitleAuthor) {
        String isbnKey = BookMatchKeys.isbnKey(row.isbn());
        if (isbnKey != null) {
            return isbnKey;
        }
        String titleAuthorKey = BookMatchKeys.titleAuthorKey(row.title(), row.author());
        if (titleAuthorKey != null) {
            return isbnKeyByTitleAuthor.getOrDefault(titleAuthorKey, titleAuthorKey);
        }
        return "id:" + row.bookId();
    }

    /** 1グループ(=1冊とみなす本の行の集まり)の統計を、ユーザーごとに重複排除しながら計算する。 */
    static GroupStats computeGroupStats(String key, List<ActivityRow> rows, Set<Integer> recommendedReadingIds,
            Instant now) {
        Map<Integer, UserAgg> byUser = new HashMap<>();
        Map<Integer, BookRowInfo> byBookId = new LinkedHashMap<>();

        for (ActivityRow row : rows) {
            boolean recommended = recommendedReadingIds.contains(row.readingId());
            UserAgg agg = byUser.computeIfAbsent(row.userId(), k -> new UserAgg());
            agg.statusWeight = Math.max(agg.statusWeight, statusWeight(row.statusType()));
            agg.rate = Math.max(agg.rate, row.rate() == null ? 0 : row.rate());
            agg.recommended = agg.recommended || recommended;
            agg.lastActivityAt = maxInstant(agg.lastActivityAt, row.lastActivityAt());

            BookRowInfo info = byBookId.computeIfAbsent(row.bookId(),
                    k -> new BookRowInfo(row.bookId(), row.thumbnail() != null, row.isbn() != null));
            info.readers.add(row.userId());
        }

        int readerCount = byUser.size();
        int ratingSum = 0;
        int ratingCount = 0;
        int recommendCount = 0;
        double voteWeightSum = 0;
        double voteWeightCount = 0;
        double popularityScore = 0;
        Instant latestActivityAt = null;

        for (UserAgg agg : byUser.values()) {
            latestActivityAt = maxInstant(latestActivityAt, agg.lastActivityAt);
            if (agg.rate > 0) {
                ratingSum += agg.rate;
                ratingCount++;
            }
            if (agg.recommended) {
                recommendCount++;
                int effectiveRate = agg.rate > 0 ? agg.rate : RECOMMEND_ASSUMED_RATE;
                voteWeightSum += (double) effectiveRate * RECOMMEND_VOTE_WEIGHT;
                voteWeightCount += RECOMMEND_VOTE_WEIGHT;
            } else if (agg.rate > 0) {
                voteWeightSum += agg.rate;
                voteWeightCount += 1;
            }

            double decay = decay(now, agg.lastActivityAt);
            double weight = agg.statusWeight
                    + (agg.rate >= HIGH_RATING_THRESHOLD ? 1 : 0)
                    + (agg.recommended ? RECOMMEND_POPULARITY_BONUS : 0);
            popularityScore += weight * decay;
        }

        Double averageRating = ratingCount > 0 ? (double) ratingSum / ratingCount : null;
        Integer representativeBookId = chooseRepresentative(byBookId.values());

        return new GroupStats(key, representativeBookId, readerCount, averageRating, ratingCount, recommendCount,
                ratingSum, voteWeightSum, voteWeightCount, popularityScore, latestActivityAt);
    }

    /** 書影あり→ISBNあり→読んだ人数が多い→bookIdが小さい、の順で代表の本を選ぶ。 */
    private static Integer chooseRepresentative(java.util.Collection<BookRowInfo> candidates) {
        return candidates.stream()
                .max(Comparator.<BookRowInfo>comparingInt(c -> c.hasThumbnail ? 1 : 0)
                        .thenComparingInt(c -> c.hasIsbn ? 1 : 0)
                        .thenComparingInt(c -> c.readers.size())
                        .thenComparing(c -> -c.bookId))
                .map(c -> c.bookId)
                .orElse(null);
    }

    static double globalAverageRating(List<GroupStats> stats) {
        int totalRatingSum = 0;
        int totalRatingCount = 0;
        for (GroupStats s : stats) {
            totalRatingSum += s.ratingSum();
            totalRatingCount += s.ratingCount();
        }
        return totalRatingCount > 0 ? (double) totalRatingSum / totalRatingCount : DEFAULT_GLOBAL_AVERAGE;
    }

    /**
     * ★とRecommendのベイズ平均でランキングする。Recommendした人は★(無ければ5)を2票分として数え、
     * ★のみの人は1票として数える。平均★3.5未満かつRecommend無しの本は除外する。
     */
    static List<RankedGroup> rankTopRated(List<GroupStats> stats, double globalAverage, int limit) {
        return stats.stream()
                .filter(s -> s.representativeBookId() != null)
                .filter(s -> (s.averageRating() != null && s.averageRating() >= MIN_AVERAGE_RATING_TO_LIST)
                        || s.recommendCount() > 0)
                .map(s -> new RankedGroup(s, bayesianRating(s, globalAverage)))
                .sorted(Comparator.comparingDouble(RankedGroup::score).reversed()
                        .thenComparing((RankedGroup g) -> g.stats().voteWeightCount(), Comparator.reverseOrder())
                        .thenComparing((RankedGroup g) -> g.stats().recommendCount(), Comparator.reverseOrder())
                        .thenComparing(BookDiscoveryService::latestActivityOrEpoch, Comparator.reverseOrder())
                        .thenComparing(g -> g.stats().key()))
                .limit(limit)
                .toList();
    }

    private static double bayesianRating(GroupStats stats, double globalAverage) {
        if (stats.voteWeightCount() <= 0) {
            return 0;
        }
        return (stats.voteWeightSum() + BAYESIAN_MIN_VOTES * globalAverage)
                / (stats.voteWeightCount() + BAYESIAN_MIN_VOTES);
    }

    /** 直近のアクティビティほど重く数える(30日で重みが半分)。読書状態・高評価・Recommendを加点する。 */
    static List<RankedGroup> rankPopular(List<GroupStats> stats, int limit) {
        return stats.stream()
                .filter(s -> s.representativeBookId() != null)
                .filter(s -> s.popularityScore() > 0)
                .map(s -> new RankedGroup(s, s.popularityScore()))
                .sorted(Comparator.comparingDouble(RankedGroup::score).reversed()
                        .thenComparing((RankedGroup g) -> g.stats().readerCount(), Comparator.reverseOrder())
                        .thenComparing(BookDiscoveryService::latestActivityOrEpoch, Comparator.reverseOrder())
                        .thenComparing(g -> g.stats().key()))
                .limit(limit)
                .toList();
    }

    private static Instant latestActivityOrEpoch(RankedGroup group) {
        return group.stats().latestActivityAt() != null ? group.stats().latestActivityAt() : Instant.EPOCH;
    }

    private static int statusWeight(BookStatusType statusType) {
        return switch (statusType) {
            case NONE -> 1;
            case DOING -> 2;
            case DONE -> 3;
            case INVALID -> 0;
        };
    }

    /** 経過日数に対する減衰係数(半減期30日の指数減衰)。アクティビティ日時が無ければ最も古いものとして扱う。 */
    private static double decay(Instant now, Instant lastActivityAt) {
        if (lastActivityAt == null) {
            return 0;
        }
        double ageDays = Duration.between(lastActivityAt, now).toMinutes() / (24.0 * 60.0);
        if (ageDays < 0) {
            ageDays = 0;
        }
        return Math.pow(0.5, ageDays / POPULARITY_HALF_LIFE_DAYS);
    }

    private static Instant maxInstant(Instant a, Instant b) {
        if (a == null) {
            return b;
        }
        if (b == null) {
            return a;
        }
        return a.isAfter(b) ? a : b;
    }

    /** フォロー中ユーザーの最近の読書を、本ごとに束ねて返す(自分自身は呼び出し前に除外済み)。 */
    static List<Book.FollowingActivity> groupFollowing(List<Reading> recent, int limit, int maxReaders) {
        Map<String, List<Reading>> byKey = new LinkedHashMap<>();
        Map<String, String> isbnKeyByTitleAuthor = new HashMap<>();
        for (Reading reading : recent) {
            Book book = reading.getBook();
            String isbnKey = BookMatchKeys.isbnKey(book.getIsbn());
            if (isbnKey != null) {
                String titleAuthorKey = BookMatchKeys.titleAuthorKey(book.getTitle(), book.getAuthor());
                if (titleAuthorKey != null) {
                    isbnKeyByTitleAuthor.putIfAbsent(titleAuthorKey, isbnKey);
                }
            }
        }
        for (Reading reading : recent) {
            Book book = reading.getBook();
            String isbnKey = BookMatchKeys.isbnKey(book.getIsbn());
            String key;
            if (isbnKey != null) {
                key = isbnKey;
            } else {
                String titleAuthorKey = BookMatchKeys.titleAuthorKey(book.getTitle(), book.getAuthor());
                key = titleAuthorKey != null ? isbnKeyByTitleAuthor.getOrDefault(titleAuthorKey, titleAuthorKey)
                        : "id:" + book.getBookId();
            }
            byKey.computeIfAbsent(key, k -> new ArrayList<>()).add(reading);
        }

        List<Book.FollowingActivity> result = new ArrayList<>();
        for (List<Reading> readings : byKey.values()) {
            if (result.size() >= limit) {
                break;
            }
            Reading representative = readings.stream()
                    .max(Comparator.<Reading>comparingInt(r -> r.getBook().getThumbnail() != null ? 1 : 0)
                            .thenComparingInt(r -> r.getBook().getIsbn() != null ? 1 : 0)
                            .thenComparing(r -> -r.getBook().getBookId()))
                    .orElseThrow();

            Map<Integer, Account> readerAccounts = new LinkedHashMap<>();
            Instant latestActivityAt = null;
            BookStatusType latestStatus = null;
            for (Reading reading : readings) {
                readerAccounts.putIfAbsent(reading.getUser().getUserId(), reading.getUser());
                Instant activityAt = reading.lastActivityAt();
                if (latestActivityAt == null || (activityAt != null && activityAt.isAfter(latestActivityAt))) {
                    latestActivityAt = activityAt;
                    latestStatus = reading.getStatusType();
                }
            }
            List<Account.UserSummary> readers = readerAccounts.values().stream()
                    .limit(maxReaders)
                    .map(Account.UserSummary::of)
                    .toList();
            result.add(new Book.FollowingActivity(representative.getBook(), readers, latestStatus, latestActivityAt));
        }
        return result;
    }

    /** ユーザーごとの、あるグループ内での最大状態・最大評価・Recommend有無・最終アクティビティ。 */
    private static final class UserAgg {
        int statusWeight;
        int rate;
        boolean recommended;
        Instant lastActivityAt;
    }

    /** グループ内の、あるbookId行についての書影・ISBN有無と読者集合(代表選びと読者数カウント用)。 */
    private static final class BookRowInfo {
        final Integer bookId;
        final boolean hasThumbnail;
        final boolean hasIsbn;
        final Set<Integer> readers = new HashSet<>();

        BookRowInfo(Integer bookId, boolean hasThumbnail, boolean hasIsbn) {
            this.bookId = bookId;
            this.hasThumbnail = hasThumbnail;
            this.hasIsbn = hasIsbn;
        }
    }

    /** 1グループ(=1冊とみなす本)の集計結果。 */
    record GroupStats(String key, Integer representativeBookId, int readerCount, Double averageRating,
            int ratingCount, int recommendCount, int ratingSum, double voteWeightSum, double voteWeightCount,
            double popularityScore, Instant latestActivityAt) {
    }

    /** ランキング済みの1グループと、そのランキングでのスコア。 */
    record RankedGroup(GroupStats stats, double score) {
    }

    /** 計算済みの評価の高い本・今読まれている本と、キャッシュの有効期限。 */
    private record Snapshot(List<Book.Ranked> topRated, List<Book.Ranked> popular, Instant expiresAt) {
    }
}
