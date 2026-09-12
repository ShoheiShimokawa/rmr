package com.rmr.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.rmr.backend.context.ReadingRepository;
import com.rmr.backend.model.Book;
import com.rmr.backend.model.Reading;
import com.rmr.backend.type.BookStatusType;

class ReadingServiceTest {

	@Test
	void findByBookIdOrIsbnPassesIdAndIsbnToRepositoryAndFiltersInvalid() {
		ReadingRepository rep = mock(ReadingRepository.class);
		Reading active = Reading.builder().readingId(1).statusType(BookStatusType.DOING)
				.book(Book.builder().bookId(1).build()).build();
		Reading invalid = Reading.builder().readingId(2).statusType(BookStatusType.INVALID)
				.book(Book.builder().bookId(1).build()).build();
		when(rep.findByBookIdOrIsbn("new-source-id", "9784000000001")).thenReturn(List.of(active, invalid));

		ReadingService service = new ReadingService(rep, null, null, null);
		List<Reading> result = service.findByBookIdOrIsbn("new-source-id", "9784000000001");

		assertThat(result).containsExactly(active);
	}

	@Test
	void findByBookIdOrIsbnTreatsBlankIsbnAsUnspecifiedToAvoidMatchingUnrelatedBooks() {
		ReadingRepository rep = mock(ReadingRepository.class);
		Reading reading = Reading.builder().readingId(1).statusType(BookStatusType.DOING)
				.book(Book.builder().bookId(1).build()).build();
		when(rep.findByBookIdOrIsbn("new-source-id", null)).thenReturn(List.of(reading));

		ReadingService service = new ReadingService(rep, null, null, null);
		List<Reading> result = service.findByBookIdOrIsbn("new-source-id", "");

		assertThat(result).containsExactly(reading);
	}
}
