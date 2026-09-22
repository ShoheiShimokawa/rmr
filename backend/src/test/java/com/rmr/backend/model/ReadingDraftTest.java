package com.rmr.backend.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.BookRepository;
import com.rmr.backend.context.ReadingDraftRepository;
import com.rmr.backend.model.ReadingDraft.SaveReadingDraft;

class ReadingDraftTest {

	private final Book book = Book.builder().bookId(1).build();
	private final Account user = Account.builder().userId(2).build();

	@Test
	void saveCreatesNewDraftWhenNoneExistsForTheBook() {
		ReadingDraftRepository rep = mock(ReadingDraftRepository.class);
		BookRepository bRep = mock(BookRepository.class);
		AccountRepository aRep = mock(AccountRepository.class);
		when(bRep.findById(1)).thenReturn(Optional.of(book));
		when(aRep.findByUserId(2)).thenReturn(Optional.of(user));
		when(rep.findByUserUserIdAndBookBookId(2, 1)).thenReturn(Optional.empty());
		when(rep.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

		ReadingDraft result = ReadingDraft.save(rep, bRep, aRep, 2, new SaveReadingDraft(1, 4, "so far so good", true));

		assertThat(result.getDraftId()).isNull();
		assertThat(result.getUser()).isEqualTo(user);
		assertThat(result.getBook()).isEqualTo(book);
		assertThat(result.getRate()).isEqualTo(4);
		assertThat(result.getThoughts()).isEqualTo("so far so good");
		assertThat(result.isRecommended()).isTrue();
		assertThat(result.getRegisterDate()).isNotNull();
		assertThat(result.getUpdateDate()).isEqualTo(result.getRegisterDate());
	}

	@Test
	void saveOverwritesExistingDraftForTheSameBookInsteadOfCreatingDuplicate() {
		ReadingDraftRepository rep = mock(ReadingDraftRepository.class);
		BookRepository bRep = mock(BookRepository.class);
		AccountRepository aRep = mock(AccountRepository.class);
		Instant registered = Instant.parse("2026-09-01T00:00:00Z");
		ReadingDraft existing = ReadingDraft.builder().draftId(10).user(user).book(book)
				.rate(1).thoughts("old").recommended(false).registerDate(registered).updateDate(registered).build();
		when(bRep.findById(1)).thenReturn(Optional.of(book));
		when(aRep.findByUserId(2)).thenReturn(Optional.of(user));
		when(rep.findByUserUserIdAndBookBookId(2, 1)).thenReturn(Optional.of(existing));
		when(rep.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

		ReadingDraft result = ReadingDraft.save(rep, bRep, aRep, 2, new SaveReadingDraft(1, 5, "new", true));

		assertThat(result.getDraftId()).isEqualTo(10);
		assertThat(result.getRate()).isEqualTo(5);
		assertThat(result.getThoughts()).isEqualTo("new");
		assertThat(result.isRecommended()).isTrue();
		assertThat(result.getRegisterDate()).isEqualTo(registered);
		assertThat(result.getUpdateDate()).isAfter(registered);
		verify(rep).save(existing);
	}

	@Test
	void deleteRemovesTheDraftOfTheUserAndBook() {
		ReadingDraftRepository rep = mock(ReadingDraftRepository.class);
		ReadingDraft existing = ReadingDraft.builder().draftId(10).user(user).book(book).build();
		when(rep.findByUserUserIdAndBookBookId(2, 1)).thenReturn(Optional.of(existing));

		ReadingDraft.delete(rep, 2, 1);

		verify(rep).delete(existing);
	}

	@Test
	void deleteDoesNothingWhenNoDraftExists() {
		ReadingDraftRepository rep = mock(ReadingDraftRepository.class);
		when(rep.findByUserUserIdAndBookBookId(2, 1)).thenReturn(Optional.empty());

		ReadingDraft.delete(rep, 2, 1);

		verify(rep, never()).delete(any());
	}

	@Test
	void findByUserIdDelegatesToRepositoryOrderedByUpdateDate() {
		ReadingDraftRepository rep = mock(ReadingDraftRepository.class);
		ReadingDraft draft = ReadingDraft.builder().draftId(10).user(user).book(book).build();
		when(rep.findByUserUserIdOrderByUpdateDateDesc(2)).thenReturn(List.of(draft));

		assertThat(ReadingDraft.findByUserId(rep, 2)).containsExactly(draft);
	}
}
