package com.rmr.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.BookRepository;
import com.rmr.backend.context.ReadingDraftRepository;
import com.rmr.backend.model.Account;
import com.rmr.backend.model.Book;
import com.rmr.backend.model.ReadingDraft;
import com.rmr.backend.model.ReadingDraft.SaveReadingDraft;
import com.rmr.backend.util.BadRequestException;

class ReadingDraftServiceTest {

	@Test
	void saveRejectsMissingBookId() {
		ReadingDraftService service = new ReadingDraftService(mock(ReadingDraftRepository.class), null, null);

		assertThatThrownBy(() -> service.save(2, new SaveReadingDraft(null, 0, "text", false)))
				.isInstanceOf(BadRequestException.class);
	}

	@Test
	void saveRejectsThoughtsLongerThanTheDraftLimit() {
		ReadingDraftService service = new ReadingDraftService(mock(ReadingDraftRepository.class), null, null);
		String tooLong = "a".repeat(ReadingDraftService.MAX_THOUGHTS_LENGTH + 1);

		assertThatThrownBy(() -> service.save(2, new SaveReadingDraft(1, 0, tooLong, false)))
				.isInstanceOf(BadRequestException.class);
	}

	@Test
	void saveNormalizesNullThoughtsAndRateBeforeSaving() {
		ReadingDraftRepository rep = mock(ReadingDraftRepository.class);
		BookRepository bRep = mock(BookRepository.class);
		AccountRepository aRep = mock(AccountRepository.class);
		when(bRep.findById(1)).thenReturn(Optional.of(Book.builder().bookId(1).build()));
		when(aRep.findByUserId(2)).thenReturn(Optional.of(Account.builder().userId(2).build()));
		when(rep.findByUserUserIdAndBookBookId(2, 1)).thenReturn(Optional.empty());
		when(rep.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

		ReadingDraft result = new ReadingDraftService(rep, bRep, aRep).save(2, new SaveReadingDraft(1, null, null, true));

		assertThat(result.getThoughts()).isEmpty();
		assertThat(result.getRate()).isZero();
		assertThat(result.isRecommended()).isTrue();
	}

	@Test
	void deleteRejectsMissingBookId() {
		ReadingDraftService service = new ReadingDraftService(mock(ReadingDraftRepository.class), null, null);

		assertThatThrownBy(() -> service.delete(2, null)).isInstanceOf(BadRequestException.class);
	}
}
