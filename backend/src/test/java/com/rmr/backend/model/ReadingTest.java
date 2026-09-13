package com.rmr.backend.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.BookRepository;
import com.rmr.backend.context.ReadingRepository;
import com.rmr.backend.model.Reading.Analytics;
import com.rmr.backend.model.Reading.RegisterReading;
import com.rmr.backend.type.BookStatusType;
import com.rmr.backend.type.LargeGenreType;

class ReadingTest {

	private final Book book = Book.builder().bookId(1).build();
	private final Account user = Account.builder().userId(2).build();

	@Test
	void registerUpdatesExistingActiveReadingInsteadOfCreatingDuplicate() {
		ReadingRepository rep = mock(ReadingRepository.class);
		BookRepository bRep = mock(BookRepository.class);
		AccountRepository aRep = mock(AccountRepository.class);
		Reading existing = Reading.builder()
				.readingId(10)
				.book(book)
				.user(user)
				.statusType(BookStatusType.NONE)
				.build();
		when(bRep.findById(1)).thenReturn(Optional.of(book));
		when(aRep.findByUserId(2)).thenReturn(Optional.of(user));
		when(rep.findByUserUserIdAndBookBookId(2, 1)).thenReturn(Optional.of(existing));
		when(rep.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

		RegisterReading param = RegisterReading.builder()
				.userId(2).bookId(1).rate(0).thoughts("").statusType(BookStatusType.DOING).build();
		Reading result = Reading.register(rep, bRep, aRep, param);

		assertEquals(10, result.getReadingId());
		assertEquals(BookStatusType.DOING, result.getStatusType());
		verify(rep).save(existing);
	}

	@Test
	void registerCreatesNewReadingWhenNoneExists() {
		ReadingRepository rep = mock(ReadingRepository.class);
		BookRepository bRep = mock(BookRepository.class);
		AccountRepository aRep = mock(AccountRepository.class);
		when(bRep.findById(1)).thenReturn(Optional.of(book));
		when(aRep.findByUserId(2)).thenReturn(Optional.of(user));
		when(rep.findByUserUserIdAndBookBookId(2, 1)).thenReturn(Optional.empty());
		when(rep.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

		RegisterReading param = RegisterReading.builder()
				.userId(2).bookId(1).rate(0).thoughts("").statusType(BookStatusType.NONE).build();
		Reading result = Reading.register(rep, bRep, aRep, param);

		assertEquals(null, result.getReadingId());
		assertEquals(book, result.getBook());
		assertEquals(user, result.getUser());
	}

	@Test
	void analyticsAssignsReadDateToLocalMonthAndYearAccordingToZone() {
		ZoneId zone = ZoneId.of("Asia/Tokyo");
		Book fiction = Book.builder().bookId(1).largeGenre(LargeGenreType.FICTION).build();
		Reading reading = Reading.builder().book(fiction).user(user).statusType(BookStatusType.DONE)
				.readDate(Instant.parse("2026-08-31T23:30:00Z")).build();

		Analytics analytics = Analytics.of(List.of(reading), zone, LocalDate.of(2026, 9, 13));

		assertThat(analytics.monthly()).extracting(Analytics.MonthlyPoint::month, Analytics.MonthlyPoint::total)
				.containsExactly(org.assertj.core.groups.Tuple.tuple("2026-09", 1));
		assertThat(analytics.yearly()).extracting(Analytics.YearlyPoint::year, Analytics.YearlyPoint::total)
				.containsExactly(org.assertj.core.groups.Tuple.tuple(2026, 1));
		assertThat(analytics.summary().doneThisYear()).isEqualTo(1);
		assertThat(analytics.summary().doneThisMonth()).isEqualTo(1);
	}

	@Test
	void analyticsCountsStatusesAndAveragesOnlyPositiveRates() {
		Book book = Book.builder().bookId(1).build();
		List<Reading> readings = List.of(
				Reading.builder().book(book).user(user).statusType(BookStatusType.NONE).build(),
				Reading.builder().book(book).user(user).statusType(BookStatusType.DOING).build(),
				Reading.builder().book(book).user(user).statusType(BookStatusType.DONE).rate(0).build(),
				Reading.builder().book(book).user(user).statusType(BookStatusType.DONE).rate(4).build(),
				Reading.builder().book(book).user(user).statusType(BookStatusType.DONE).rate(5).build());

		Analytics analytics = Analytics.of(readings, ZoneId.of("UTC"), LocalDate.of(2026, 9, 13));

		assertThat(analytics.status()).isEqualTo(new Analytics.StatusCounts(1, 1, 3));
		assertThat(analytics.summary().avgRate()).isEqualTo(4.5);
	}

	@Test
	void analyticsAvgRateIsNullWhenNoRatedReadingsExist() {
		Book book = Book.builder().bookId(1).build();
		List<Reading> readings = List.of(
				Reading.builder().book(book).user(user).statusType(BookStatusType.DONE).rate(0).build());

		Analytics analytics = Analytics.of(readings, ZoneId.of("UTC"), LocalDate.of(2026, 9, 13));

		assertThat(analytics.summary().avgRate()).isNull();
	}

	@Test
	void analyticsCountsDoneReadingWithoutReadDateButExcludesItFromTimeSeries() {
		Book book = Book.builder().bookId(1).build();
		Reading noReadDate = Reading.builder().book(book).user(user).statusType(BookStatusType.DONE).build();

		Analytics analytics = Analytics.of(List.of(noReadDate), ZoneId.of("UTC"), LocalDate.of(2026, 9, 13));

		assertThat(analytics.summary().done()).isEqualTo(1);
		assertThat(analytics.monthly()).isEmpty();
		assertThat(analytics.yearly()).isEmpty();
	}

	@Test
	void analyticsRanksTopAuthorsDescendingAndExcludesBlankAuthors() {
		List<Reading> readings = List.of(
				doneReadingByAuthor("Author A"), doneReadingByAuthor("Author A"), doneReadingByAuthor("Author A"),
				doneReadingByAuthor("Author B"), doneReadingByAuthor("Author B"),
				doneReadingByAuthor("Author C"),
				doneReadingByAuthor("Author D"),
				doneReadingByAuthor("Author E"),
				doneReadingByAuthor("Author F"),
				doneReadingByAuthor(""), doneReadingByAuthor(null));

		Analytics analytics = Analytics.of(readings, ZoneId.of("UTC"), LocalDate.of(2026, 9, 13));

		assertThat(analytics.topAuthors()).extracting(Analytics.AuthorCount::author).hasSize(5)
				.containsExactly("Author A", "Author B", "Author C", "Author D", "Author E");
	}

	private Reading doneReadingByAuthor(String author) {
		Book book = Book.builder().bookId(1).author(author).build();
		return Reading.builder().book(book).user(user).statusType(BookStatusType.DONE).build();
	}
}
