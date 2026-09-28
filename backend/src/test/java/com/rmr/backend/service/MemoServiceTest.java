package com.rmr.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.LabelRepository;
import com.rmr.backend.context.MemoRepository;
import com.rmr.backend.context.ReadingRepository;
import com.rmr.backend.model.Account;
import com.rmr.backend.model.Book;
import com.rmr.backend.model.Label;
import com.rmr.backend.model.Memo;
import com.rmr.backend.model.Memo.HighlightFields;
import com.rmr.backend.model.Memo.HighlightView;
import com.rmr.backend.model.Memo.RegisterHighlight;
import com.rmr.backend.model.Memo.UpdateHighlight;
import com.rmr.backend.model.Reading;
import com.rmr.backend.type.BookStatusType;
import com.rmr.backend.type.HighlightVisibility;
import com.rmr.backend.util.BadRequestException;
import com.rmr.backend.util.NotFoundException;

class MemoServiceTest {

	// --- normalize(検証) ---

	@Test
	void normalizeRejectsBlankQuote() {
		assertThatThrownBy(() -> MemoService.normalize("   ", null, null, null))
				.isInstanceOf(BadRequestException.class);
	}

	@Test
	void normalizeRejectsQuoteLongerThanTheLimit() {
		String tooLong = "a".repeat(MemoService.MAX_QUOTE_LENGTH + 1);

		assertThatThrownBy(() -> MemoService.normalize(tooLong, null, null, null))
				.isInstanceOf(BadRequestException.class);
	}

	@Test
	void normalizeRejectsNoteLongerThanTheLimit() {
		String tooLong = "a".repeat(MemoService.MAX_NOTE_LENGTH + 1);

		assertThatThrownBy(() -> MemoService.normalize("quote", tooLong, null, null))
				.isInstanceOf(BadRequestException.class);
	}

	@Test
	void normalizeRejectsLabelLongerThanTheLimit() {
		String tooLong = "a".repeat(MemoService.MAX_LABEL_LENGTH + 1);

		assertThatThrownBy(() -> MemoService.normalize("quote", null, null, tooLong))
				.isInstanceOf(BadRequestException.class);
	}

	@Test
	void normalizeRejectsPageBelowMinimum() {
		assertThatThrownBy(() -> MemoService.normalize("quote", null, 0, null))
				.isInstanceOf(BadRequestException.class);
	}

	@Test
	void normalizeRejectsPageAboveMaximum() {
		assertThatThrownBy(() -> MemoService.normalize("quote", null, 100_000, null))
				.isInstanceOf(BadRequestException.class);
	}

	@Test
	void normalizeAllowsNullPageAndTrimsBlankNoteAndLabelToNull() {
		HighlightFields fields = MemoService.normalize(" quote ", "  ", null, "  ");

		assertThat(fields.quote()).isEqualTo("quote");
		assertThat(fields.note()).isNull();
		assertThat(fields.label()).isNull();
		assertThat(fields.page()).isNull();
	}

	// --- register ---

	@Test
	void registerCreatesAPrivateHighlightOwnedByTheReadingsUser() {
		MemoRepository rep = mock(MemoRepository.class);
		ReadingRepository rRep = mock(ReadingRepository.class);
		Account user = Account.builder().userId(2).build();
		Reading reading = Reading.builder().readingId(10).user(user).statusType(BookStatusType.DOING)
				.book(Book.builder().bookId(1).build()).build();
		when(rRep.findById(10)).thenReturn(Optional.of(reading));
		when(rep.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

		MemoService service = new MemoService(rep, rRep, null, null);
		HighlightView result = service.register(2, new RegisterHighlight(10, "quote", null, null, null));

		assertThat(result.quote()).isEqualTo("quote");
		assertThat(result.visibility()).isEqualTo(HighlightVisibility.PRIVATE);
		assertThat(result.spoiler()).isFalse();
		assertThat(result.registerDate()).isNotNull();
		assertThat(result.updateDate()).isNotNull();
	}

	@Test
	void registerFindsOrCreatesTheLabelForTheCurrentUser() {
		MemoRepository rep = mock(MemoRepository.class);
		ReadingRepository rRep = mock(ReadingRepository.class);
		LabelRepository lRep = mock(LabelRepository.class);
		AccountRepository aRep = mock(AccountRepository.class);
		Account user = Account.builder().userId(2).build();
		Reading reading = Reading.builder().readingId(10).user(user).statusType(BookStatusType.DOING)
				.book(Book.builder().bookId(1).build()).build();
		Label label = Label.builder().labelId(7).label("work").build();
		when(rRep.findById(10)).thenReturn(Optional.of(reading));
		when(lRep.findFirstByUserUserIdAndLabelOrderByLabelIdAsc(2, "work")).thenReturn(Optional.of(label));
		when(rep.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

		MemoService service = new MemoService(rep, rRep, lRep, aRep);
		HighlightView result = service.register(2, new RegisterHighlight(10, "quote", null, null, "work"));

		assertThat(result.label()).isNotNull();
		assertThat(result.label().name()).isEqualTo("work");
		verifyNoInteractions(aRep);
	}

	@Test
	void registerRejectsAReadingOwnedBySomeoneElse() {
		MemoRepository rep = mock(MemoRepository.class);
		ReadingRepository rRep = mock(ReadingRepository.class);
		Account someoneElse = Account.builder().userId(99).build();
		Reading reading = Reading.builder().readingId(10).user(someoneElse).statusType(BookStatusType.DOING)
				.book(Book.builder().bookId(1).build()).build();
		when(rRep.findById(10)).thenReturn(Optional.of(reading));

		MemoService service = new MemoService(rep, rRep, null, null);

		assertThatThrownBy(() -> service.register(2, new RegisterHighlight(10, "quote", null, null, null)))
				.isInstanceOf(ResponseStatusException.class)
				.satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
						.isEqualTo(HttpStatus.FORBIDDEN));
	}

	@Test
	void registerRejectsAnInvalidReading() {
		MemoRepository rep = mock(MemoRepository.class);
		ReadingRepository rRep = mock(ReadingRepository.class);
		Account user = Account.builder().userId(2).build();
		Reading reading = Reading.builder().readingId(10).user(user).statusType(BookStatusType.INVALID)
				.book(Book.builder().bookId(1).build()).build();
		when(rRep.findById(10)).thenReturn(Optional.of(reading));

		MemoService service = new MemoService(rep, rRep, null, null);

		assertThatThrownBy(() -> service.register(2, new RegisterHighlight(10, "quote", null, null, null)))
				.isInstanceOf(BadRequestException.class);
	}

	@Test
	void registerRejectsAMissingReadingAsNotFound() {
		MemoRepository rep = mock(MemoRepository.class);
		ReadingRepository rRep = mock(ReadingRepository.class);
		when(rRep.findById(10)).thenReturn(Optional.empty());

		MemoService service = new MemoService(rep, rRep, null, null);

		assertThatThrownBy(() -> service.register(2, new RegisterHighlight(10, "quote", null, null, null)))
				.isInstanceOf(NotFoundException.class);
	}

	// --- update / delete: 所有者チェック ---

	@Test
	void updateRejectsAMemoOwnedBySomeoneElseAsNotFound() {
		MemoRepository rep = mock(MemoRepository.class);
		Account owner = Account.builder().userId(99).build();
		Memo memo = Memo.builder().memoId(5).user(owner).build();
		when(rep.findById(5)).thenReturn(Optional.of(memo));

		MemoService service = new MemoService(rep, null, null, null);

		assertThatThrownBy(() -> service.update(2, new UpdateHighlight(5, "quote", null, null, null, null)))
				.isInstanceOf(NotFoundException.class);
	}

	@Test
	void updateRejectsAMissingMemoAsNotFound() {
		MemoRepository rep = mock(MemoRepository.class);
		when(rep.findById(5)).thenReturn(Optional.empty());

		MemoService service = new MemoService(rep, null, null, null);

		assertThatThrownBy(() -> service.update(2, new UpdateHighlight(5, "quote", null, null, null, null)))
				.isInstanceOf(NotFoundException.class);
	}

	@Test
	void deleteRemovesAnOwnedMemo() {
		MemoRepository rep = mock(MemoRepository.class);
		Account owner = Account.builder().userId(2).build();
		Memo memo = Memo.builder().memoId(5).user(owner).build();
		when(rep.findById(5)).thenReturn(Optional.of(memo));

		new MemoService(rep, null, null, null).delete(2, 5);

		verify(rep).delete(memo);
	}

	@Test
	void deleteRejectsAMemoOwnedBySomeoneElseAsNotFoundAndNeverDeletes() {
		MemoRepository rep = mock(MemoRepository.class);
		Account owner = Account.builder().userId(99).build();
		Memo memo = Memo.builder().memoId(5).user(owner).build();
		when(rep.findById(5)).thenReturn(Optional.of(memo));

		MemoService service = new MemoService(rep, null, null, null);

		assertThatThrownBy(() -> service.delete(2, 5)).isInstanceOf(NotFoundException.class);
		verify(rep, never()).delete(any(Memo.class));
	}

	// --- findByUser / findById: 見える範囲 ---

	@Test
	void findByUserReturnsEverythingWithLabelsForTheOwner() {
		MemoRepository rep = mock(MemoRepository.class);
		Account owner = Account.builder().userId(2).build();
		Reading reading = Reading.builder().readingId(10).user(owner).book(Book.builder().bookId(1).build()).build();
		Memo memo = Memo.builder().memoId(5).user(owner).reading(reading).memo("quote")
				.label(Label.builder().labelId(1).label("work").build()).build();
		when(rep.findAllByUserIdNewestFirst(2)).thenReturn(List.of(memo));

		List<HighlightView> result = new MemoService(rep, null, null, null).findByUser(2, 2);

		assertThat(result).hasSize(1);
		assertThat(result.get(0).label()).isNotNull();
	}

	@Test
	void findByUserReturnsOnlyPublicHighlightsWithoutLabelsForOthers() {
		MemoRepository rep = mock(MemoRepository.class);
		Account owner = Account.builder().userId(2).build();
		Reading reading = Reading.builder().readingId(10).user(owner).book(Book.builder().bookId(1).build()).build();
		Memo memo = Memo.builder().memoId(5).user(owner).reading(reading).memo("quote")
				.visibility(HighlightVisibility.PUBLIC)
				.label(Label.builder().labelId(1).label("work").build()).build();
		when(rep.findByUserIdAndVisibilityNewestFirst(2, HighlightVisibility.PUBLIC)).thenReturn(List.of(memo));

		List<HighlightView> result = new MemoService(rep, null, null, null).findByUser(2, 99);

		assertThat(result).hasSize(1);
		assertThat(result.get(0).label()).isNull();
	}

	@Test
	void findByUserTreatsAnAnonymousViewerAsNotTheOwner() {
		MemoRepository rep = mock(MemoRepository.class);
		when(rep.findByUserIdAndVisibilityNewestFirst(2, HighlightVisibility.PUBLIC)).thenReturn(List.of());

		List<HighlightView> result = new MemoService(rep, null, null, null).findByUser(2, null);

		assertThat(result).isEmpty();
	}

	@Test
	void findByIdReturnsAPrivateHighlightToItsOwner() {
		MemoRepository rep = mock(MemoRepository.class);
		Account owner = Account.builder().userId(2).build();
		Reading reading = Reading.builder().readingId(10).user(owner).book(Book.builder().bookId(1).build()).build();
		Memo memo = Memo.builder().memoId(5).user(owner).reading(reading).memo("quote").build();
		when(rep.findById(5)).thenReturn(Optional.of(memo));

		HighlightView result = new MemoService(rep, null, null, null).findById(5, 2);

		assertThat(result.quote()).isEqualTo("quote");
	}

	@Test
	void findByIdHidesAPrivateHighlightFromOthersAsNotFound() {
		MemoRepository rep = mock(MemoRepository.class);
		Account owner = Account.builder().userId(2).build();
		Reading reading = Reading.builder().readingId(10).user(owner).book(Book.builder().bookId(1).build()).build();
		Memo memo = Memo.builder().memoId(5).user(owner).reading(reading).memo("quote").build();
		when(rep.findById(5)).thenReturn(Optional.of(memo));

		MemoService service = new MemoService(rep, null, null, null);

		assertThatThrownBy(() -> service.findById(5, 99)).isInstanceOf(NotFoundException.class);
	}

	@Test
	void findByIdReturnsAPublicHighlightToAnyone() {
		MemoRepository rep = mock(MemoRepository.class);
		Account owner = Account.builder().userId(2).build();
		Reading reading = Reading.builder().readingId(10).user(owner).book(Book.builder().bookId(1).build()).build();
		Memo memo = Memo.builder().memoId(5).user(owner).reading(reading).memo("quote")
				.visibility(HighlightVisibility.PUBLIC).build();
		when(rep.findById(5)).thenReturn(Optional.of(memo));

		HighlightView result = new MemoService(rep, null, null, null).findById(5, null);

		assertThat(result.quote()).isEqualTo("quote");
	}
}
