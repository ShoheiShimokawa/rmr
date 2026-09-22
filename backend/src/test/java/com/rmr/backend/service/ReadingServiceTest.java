package com.rmr.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.BookRepository;
import com.rmr.backend.context.PostRepository;
import com.rmr.backend.context.ReadingDraftRepository;
import com.rmr.backend.context.ReadingRepository;
import com.rmr.backend.model.Account;
import com.rmr.backend.model.Book;
import com.rmr.backend.model.Reading;
import com.rmr.backend.model.Reading.RegisterReading;
import com.rmr.backend.model.ReadingDraft;
import com.rmr.backend.type.BookStatusType;
import com.rmr.backend.util.BadRequestException;

class ReadingServiceTest {

	@Test
	void findByBookIdOrIsbnPassesIdAndIsbnToRepositoryAndFiltersInvalid() {
		ReadingRepository rep = mock(ReadingRepository.class);
		Reading active = Reading.builder().readingId(1).statusType(BookStatusType.DOING)
				.book(Book.builder().bookId(1).build()).build();
		Reading invalid = Reading.builder().readingId(2).statusType(BookStatusType.INVALID)
				.book(Book.builder().bookId(1).build()).build();
		when(rep.findByBookIdOrIsbn("new-source-id", "9784000000001")).thenReturn(List.of(active, invalid));

		ReadingService service = new ReadingService(rep, null, null, null, null);
		List<Reading> result = service.findByBookIdOrIsbn("new-source-id", "9784000000001");

		assertThat(result).containsExactly(active);
	}

	@Test
	void findByBookIdOrIsbnTreatsBlankIsbnAsUnspecifiedToAvoidMatchingUnrelatedBooks() {
		ReadingRepository rep = mock(ReadingRepository.class);
		Reading reading = Reading.builder().readingId(1).statusType(BookStatusType.DOING)
				.book(Book.builder().bookId(1).build()).build();
		when(rep.findByBookIdOrIsbn("new-source-id", null)).thenReturn(List.of(reading));

		ReadingService service = new ReadingService(rep, null, null, null, null);
		List<Reading> result = service.findByBookIdOrIsbn("new-source-id", "");

		assertThat(result).containsExactly(reading);
	}

	@Test
	void registerDeletesTheDraftOfTheBookWhenAPostIsCreated() {
		ReadingRepository rep = mock(ReadingRepository.class);
		BookRepository bRep = mock(BookRepository.class);
		PostRepository pRep = mock(PostRepository.class);
		AccountRepository aRep = mock(AccountRepository.class);
		ReadingDraftRepository dRep = mock(ReadingDraftRepository.class);
		Book book = Book.builder().bookId(1).build();
		Account user = Account.builder().userId(2).build();
		Reading existing = Reading.builder().readingId(10).book(book).user(user)
				.statusType(BookStatusType.DOING).thoughts("").build();
		ReadingDraft draft = ReadingDraft.builder().draftId(5).user(user).book(book).build();
		when(bRep.findById(1)).thenReturn(Optional.of(book));
		when(aRep.findByUserId(2)).thenReturn(Optional.of(user));
		when(rep.findByUserUserIdAndBookBookId(2, 1)).thenReturn(Optional.of(existing));
		when(rep.findById(10)).thenReturn(Optional.of(existing));
		when(rep.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
		when(pRep.findByReadingId(10)).thenReturn(List.of());
		when(pRep.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
		when(dRep.findByUserUserIdAndBookBookId(2, 1)).thenReturn(Optional.of(draft));

		ReadingService service = new ReadingService(rep, bRep, pRep, aRep, dRep);
		service.register(RegisterReading.builder()
				.userId(2).bookId(1).rate(4).thoughts("great").statusType(BookStatusType.DONE).build());

		verify(dRep).delete(draft);
	}

	@Test
	void registerKeepsTheDraftWhenOnlyTheReadingStatusChanges() {
		ReadingRepository rep = mock(ReadingRepository.class);
		BookRepository bRep = mock(BookRepository.class);
		AccountRepository aRep = mock(AccountRepository.class);
		ReadingDraftRepository dRep = mock(ReadingDraftRepository.class);
		Book book = Book.builder().bookId(1).build();
		Account user = Account.builder().userId(2).build();
		when(bRep.findById(1)).thenReturn(Optional.of(book));
		when(aRep.findByUserId(2)).thenReturn(Optional.of(user));
		when(rep.findByUserUserIdAndBookBookId(2, 1)).thenReturn(Optional.empty());
		when(rep.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

		ReadingService service = new ReadingService(rep, bRep, null, aRep, dRep);
		service.register(RegisterReading.builder()
				.userId(2).bookId(1).rate(0).thoughts("").statusType(BookStatusType.DOING).build());

		verifyNoInteractions(dRep);
	}

	@Test
	void getAnalyticsRejectsInvalidZone() {
		ReadingRepository rep = mock(ReadingRepository.class);
		ReadingService service = new ReadingService(rep, null, null, null, null);

		assertThatThrownBy(() -> service.getAnalytics(1, "Not/AZone"))
				.isInstanceOf(BadRequestException.class);
	}
}
