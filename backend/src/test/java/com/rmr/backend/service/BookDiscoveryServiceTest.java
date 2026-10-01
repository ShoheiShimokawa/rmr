package com.rmr.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.junit.jupiter.api.Test;

import com.rmr.backend.context.BookRepository;
import com.rmr.backend.context.PostRepository;
import com.rmr.backend.context.ReadingRepository;
import com.rmr.backend.model.Account;
import com.rmr.backend.model.Book;
import com.rmr.backend.model.Reading;
import com.rmr.backend.model.Reading.ActivityRow;
import com.rmr.backend.service.BookDiscoveryService.GroupStats;
import com.rmr.backend.service.BookDiscoveryService.RankedGroup;
import com.rmr.backend.type.BookStatusType;

class BookDiscoveryServiceTest {

    private static final Instant NOW = Instant.parse("2026-10-01T00:00:00Z");

    // ---- groupByWorkKey ----

    @Test
    void groupByWorkKeyMergesRowsWithTheSameIsbnEvenWithDifferentBookIds() {
        ActivityRow a = row(1, "9784000000001", "Title", "Author", 10, 1, BookStatusType.DONE, 5, NOW);
        ActivityRow b = row(2, "9784000000001", "Title", "Author", 11, 2, BookStatusType.DOING, 0, NOW);

        Map<String, List<ActivityRow>> groups = BookDiscoveryService.groupByWorkKey(List.of(a, b));

        assertThat(groups).hasSize(1);
        assertThat(groups.values().iterator().next()).containsExactlyInAnyOrder(a, b);
    }

    @Test
    void groupByWorkKeyMergesAnIsbnLessRowIntoAMatchingIsbnGroupByTitleAndAuthor() {
        ActivityRow withIsbn = row(1, "9784000000001", "Same Title", "Same Author", 10, 1, BookStatusType.DONE, 5,
                NOW);
        ActivityRow withoutIsbn = row(2, null, "Same Title", "Same Author", 11, 2, BookStatusType.NONE, 0, NOW);

        Map<String, List<ActivityRow>> groups = BookDiscoveryService.groupByWorkKey(List.of(withIsbn, withoutIsbn));

        assertThat(groups).hasSize(1);
    }

    @Test
    void groupByWorkKeyKeepsUnrelatedBooksSeparate() {
        ActivityRow a = row(1, "9784000000001", "Title A", "Author A", 10, 1, BookStatusType.DONE, 5, NOW);
        ActivityRow b = row(2, "9784000000002", "Title B", "Author B", 11, 2, BookStatusType.DONE, 5, NOW);

        Map<String, List<ActivityRow>> groups = BookDiscoveryService.groupByWorkKey(List.of(a, b));

        assertThat(groups).hasSize(2);
    }

    @Test
    void groupByWorkKeyFallsBackToBookIdWhenNeitherIsbnNorTitleIsPresent() {
        ActivityRow a = row(1, null, null, null, 10, 1, BookStatusType.NONE, 0, NOW);
        ActivityRow b = row(2, null, null, null, 11, 2, BookStatusType.NONE, 0, NOW);

        Map<String, List<ActivityRow>> groups = BookDiscoveryService.groupByWorkKey(List.of(a, b));

        assertThat(groups).hasSize(2);
    }

    // ---- computeGroupStats ----

    @Test
    void computeGroupStatsCountsTheSameUserOnceUsingTheirMaxWeight() {
        // 同じ人が重複登録された本(bookId違い)にそれぞれ読書記録を持つ場合、1人として数える
        ActivityRow doing = row(1, "9784000000001", "Title", "Author", 10, 1, BookStatusType.DOING, 0, NOW);
        ActivityRow done = row(2, "9784000000001", "Title", "Author", 11, 1, BookStatusType.DONE, 5, NOW);

        GroupStats stats = BookDiscoveryService.computeGroupStats("isbn:9784000000001", List.of(doing, done),
                Set.of(), NOW);

        assertThat(stats.readerCount()).isEqualTo(1);
        assertThat(stats.ratingCount()).isEqualTo(1);
        assertThat(stats.averageRating()).isEqualTo(5.0);
    }

    @Test
    void computeGroupStatsCountsARecommendationWithoutARatingAsTwoVotesAtFive() {
        ActivityRow recommended = row(1, "9784000000001", "Title", "Author", 10, 1, BookStatusType.DONE, 0, NOW);

        GroupStats stats = BookDiscoveryService.computeGroupStats("isbn:9784000000001", List.of(recommended),
                Set.of(10), NOW);

        assertThat(stats.recommendCount()).isEqualTo(1);
        assertThat(stats.ratingCount()).isZero();
        assertThat(stats.averageRating()).isNull();
        assertThat(stats.voteWeightSum()).isEqualTo(10.0);
        assertThat(stats.voteWeightCount()).isEqualTo(2.0);
    }

    @Test
    void computeGroupStatsRepresentativePrefersThumbnailThenIsbnThenReaderCount() {
        ActivityRow noThumbnail = new ActivityRow(1, null, "Title", "Author", null, 10, 1, BookStatusType.NONE, 0,
                NOW);
        ActivityRow withThumbnail = new ActivityRow(2, null, "Title", "Author", "thumb.jpg", 11, 2,
                BookStatusType.NONE, 0, NOW);

        GroupStats stats = BookDiscoveryService.computeGroupStats("ta:title|author",
                List.of(noThumbnail, withThumbnail), Set.of(), NOW);

        assertThat(stats.representativeBookId()).isEqualTo(2);
    }

    @Test
    void computeGroupStatsAppliesThirtyDayHalfLifeDecayToThePopularityScore() {
        ActivityRow thirtyDaysOld = row(1, "9784000000001", "Title", "Author", 10, 1, BookStatusType.NONE, 0,
                NOW.minus(30, ChronoUnit.DAYS));

        GroupStats stats = BookDiscoveryService.computeGroupStats("isbn:9784000000001", List.of(thirtyDaysOld),
                Set.of(), NOW);

        // ステータスNONEの重み1 × 30日経過で半減 = 0.5
        assertThat(stats.popularityScore()).isCloseTo(0.5, within(0.01));
    }

    // ---- rankPopular ----

    @Test
    void rankPopularRanksRecentActivityAboveOldHighlyRatedActivity() {
        GroupStats recentLowWeight = new GroupStats("recent", 1, 1, null, 0, 0, 0, 0, 0, 1.0, NOW);
        GroupStats oldHighWeight = new GroupStats("old", 2, 1, 5.0, 1, 0, 5, 0, 0, 0.0007,
                NOW.minus(365, ChronoUnit.DAYS));

        List<RankedGroup> ranked = BookDiscoveryService.rankPopular(List.of(oldHighWeight, recentLowWeight), 20);

        assertThat(ranked).extracting(g -> g.stats().key()).containsExactly("recent", "old");
    }

    @Test
    void rankPopularBreaksTiesByReaderCount() {
        GroupStats fewerReaders = new GroupStats("few", 1, 1, null, 0, 0, 0, 0, 0, 2.0, NOW);
        GroupStats moreReaders = new GroupStats("many", 2, 3, null, 0, 0, 0, 0, 0, 2.0, NOW);

        List<RankedGroup> ranked = BookDiscoveryService.rankPopular(List.of(fewerReaders, moreReaders), 20);

        assertThat(ranked).extracting(g -> g.stats().key()).containsExactly("many", "few");
    }

    @Test
    void rankPopularExcludesGroupsWithNoScore() {
        GroupStats zeroScore = new GroupStats("zero", 1, 1, null, 0, 0, 0, 0, 0, 0.0, NOW);

        List<RankedGroup> ranked = BookDiscoveryService.rankPopular(List.of(zeroScore), 20);

        assertThat(ranked).isEmpty();
    }

    // ---- rankTopRated / globalAverageRating ----

    @Test
    void rankTopRatedRanksMoreFiveStarVotesAboveASingleFiveStarVoteAndExcludesLowRatedUnrecommendedBooks() {
        List<ActivityRow> rows = List.of(
                row(1, "A1", "Group A", "Author", 1, 101, BookStatusType.DONE, 5, NOW),
                row(1, "A1", "Group A", "Author", 2, 102, BookStatusType.DONE, 5, NOW),
                row(1, "A1", "Group A", "Author", 3, 103, BookStatusType.DONE, 5, NOW),
                row(2, "B1", "Group B", "Author", 4, 104, BookStatusType.DONE, 5, NOW),
                row(3, "C1", "Group C", "Author", 5, 105, BookStatusType.DONE, 2, NOW));

        Map<String, List<ActivityRow>> groups = BookDiscoveryService.groupByWorkKey(rows);
        List<GroupStats> stats = groups.entrySet().stream()
                .map(e -> BookDiscoveryService.computeGroupStats(e.getKey(), e.getValue(), Set.of(), NOW))
                .toList();
        double globalAverage = BookDiscoveryService.globalAverageRating(stats);

        List<RankedGroup> ranked = BookDiscoveryService.rankTopRated(stats, globalAverage, 20);

        // Cの本(★2・Recommendなし)は平均3.5未満のため除外され、Aの3票がBの1票より上位になる
        assertThat(ranked).extracting(g -> g.stats().representativeBookId()).containsExactly(1, 2);
    }

    @Test
    void rankTopRatedIncludesALowRatedBookWhenItHasBeenRecommended() {
        ActivityRow lowRatedButRecommended = row(1, "X1", "Book X", "Author", 1, 201, BookStatusType.DONE, 2, NOW);
        GroupStats stats = BookDiscoveryService.computeGroupStats("isbn:X1", List.of(lowRatedButRecommended),
                Set.of(1), NOW);

        List<RankedGroup> ranked = BookDiscoveryService.rankTopRated(List.of(stats), 3.5, 20);

        assertThat(ranked).hasSize(1);
        assertThat(ranked.get(0).stats().representativeBookId()).isEqualTo(1);
    }

    @Test
    void rankTopRatedExcludesABookWithNoRatingsAndNoRecommendations() {
        ActivityRow onlyWantToRead = row(1, "Y1", "Book Y", "Author", 1, 301, BookStatusType.NONE, 0, NOW);
        GroupStats stats = BookDiscoveryService.computeGroupStats("isbn:Y1", List.of(onlyWantToRead), Set.of(), NOW);

        List<RankedGroup> ranked = BookDiscoveryService.rankTopRated(List.of(stats), 3.5, 20);

        assertThat(ranked).isEmpty();
    }

    @Test
    void globalAverageRatingFallsBackToTheDefaultWhenThereAreNoRatings() {
        ActivityRow onlyWantToRead = row(1, "Z1", "Book Z", "Author", 1, 401, BookStatusType.NONE, 0, NOW);
        GroupStats stats = BookDiscoveryService.computeGroupStats("isbn:Z1", List.of(onlyWantToRead), Set.of(), NOW);

        double globalAverage = BookDiscoveryService.globalAverageRating(List.of(stats));

        assertThat(globalAverage).isEqualTo(BookDiscoveryService.DEFAULT_GLOBAL_AVERAGE);
    }

    // ---- groupFollowing ----

    @Test
    void groupFollowingDedupesReadersAndTracksTheMostRecentStatus() {
        Account r1 = Account.builder().userId(1).handle("r1").build();
        Account r2 = Account.builder().userId(2).handle("r2").build();
        Book book = Book.builder().bookId(1).isbn("X1").title("Title").author("Author").build();
        Reading doing = Reading.builder().readingId(1).book(book).user(r1).statusType(BookStatusType.DOING)
                .readingDate(NOW).build();
        Reading done = Reading.builder().readingId(2).book(book).user(r2).statusType(BookStatusType.DONE)
                .readDate(NOW.plusSeconds(10)).build();

        List<Book.FollowingActivity> result = BookDiscoveryService.groupFollowing(List.of(doing, done), 20, 5);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).readers()).hasSize(2);
        assertThat(result.get(0).latestStatus()).isEqualTo(BookStatusType.DONE);
    }

    @Test
    void groupFollowingCapsTheNumberOfReadersShown() {
        Book book = Book.builder().bookId(1).isbn("X1").title("Title").author("Author").build();
        List<Reading> readings = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            Account user = Account.builder().userId(i).handle("user" + i).build();
            readings.add(Reading.builder().readingId(i).book(book).user(user).statusType(BookStatusType.NONE)
                    .toReadDate(NOW).build());
        }

        List<Book.FollowingActivity> result = BookDiscoveryService.groupFollowing(readings, 20, 2);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).readers()).hasSize(2);
    }

    @Test
    void groupFollowingStopsAtTheRequestedLimit() {
        List<Reading> readings = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            Book book = Book.builder().bookId(i).isbn("ISBN" + i).title("Title " + i).author("Author").build();
            Account user = Account.builder().userId(100 + i).build();
            readings.add(Reading.builder().readingId(i).book(book).user(user).statusType(BookStatusType.DOING)
                    .readingDate(NOW).build());
        }

        List<Book.FollowingActivity> result = BookDiscoveryService.groupFollowing(readings, 3, 5);

        assertThat(result).hasSize(3);
    }

    // ---- public API (mocked repositories) ----

    @Test
    void followingReturnsEmptyAndTouchesNoRepositoryWhenAnonymous() {
        ReadingRepository readingRepository = mock(ReadingRepository.class);
        BookRepository bookRepository = mock(BookRepository.class);
        PostRepository postRepository = mock(PostRepository.class);
        BookDiscoveryService service = new BookDiscoveryService(readingRepository, bookRepository, postRepository);

        List<Book.FollowingActivity> result = service.following(null);

        assertThat(result).isEmpty();
        verifyNoInteractions(readingRepository, bookRepository, postRepository);
    }

    @Test
    void popularCachesTheSnapshotSoARepeatedCallDoesNotHitTheRepositoryAgain() {
        ReadingRepository readingRepository = mock(ReadingRepository.class);
        BookRepository bookRepository = mock(BookRepository.class);
        PostRepository postRepository = mock(PostRepository.class);
        when(readingRepository.findActivityRows()).thenReturn(
                List.of(row(1, "9784000000001", "Title", "Author", 10, 1, BookStatusType.DONE, 5, NOW)));
        when(postRepository.findReadingIdsByPostType(any())).thenReturn(List.of());
        Book book = Book.builder().bookId(1).isbn("9784000000001").title("Title").author("Author").build();
        when(bookRepository.findAllById(any())).thenReturn(List.of(book));
        BookDiscoveryService service = new BookDiscoveryService(readingRepository, bookRepository, postRepository);

        List<Book.Ranked> first = service.popular();
        List<Book.Ranked> second = service.popular();

        assertThat(first).hasSize(1);
        assertThat(second).hasSize(1);
        verify(readingRepository, times(1)).findActivityRows();
        verify(postRepository, times(1)).findReadingIdsByPostType(any());
    }

    @Test
    void topRatedLoadsOnlyTheRepresentativeBookAndMapsTheStatsBack() {
        ReadingRepository readingRepository = mock(ReadingRepository.class);
        BookRepository bookRepository = mock(BookRepository.class);
        PostRepository postRepository = mock(PostRepository.class);
        when(readingRepository.findActivityRows()).thenReturn(List.of(
                row(1, "9784000000001", "Title", "Author", 1, 1, BookStatusType.DONE, 5, NOW),
                row(1, "9784000000001", "Title", "Author", 2, 2, BookStatusType.DONE, 5, NOW),
                row(1, "9784000000001", "Title", "Author", 3, 3, BookStatusType.DONE, 5, NOW)));
        when(postRepository.findReadingIdsByPostType(any())).thenReturn(List.of());
        Book book = Book.builder().bookId(1).isbn("9784000000001").title("Title").author("Author").build();
        when(bookRepository.findAllById(Set.of(1))).thenReturn(List.of(book));
        BookDiscoveryService service = new BookDiscoveryService(readingRepository, bookRepository, postRepository);

        List<Book.Ranked> result = service.topRated();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).book()).isEqualTo(book);
        assertThat(result.get(0).readerCount()).isEqualTo(3);
        assertThat(result.get(0).averageRating()).isEqualTo(5.0);
        assertThat(result.get(0).ratingCount()).isEqualTo(3);
    }

    private static ActivityRow row(int bookId, String isbn, String title, String author, int readingId, int userId,
            BookStatusType status, int rate, Instant lastActivityAt) {
        return new ActivityRow(bookId, isbn, title, author, null, readingId, userId, status, rate, lastActivityAt);
    }
}
