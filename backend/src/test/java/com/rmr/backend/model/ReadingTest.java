package com.rmr.backend.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.BookRepository;
import com.rmr.backend.context.ReadingRepository;
import com.rmr.backend.model.Reading.RegisterReading;
import com.rmr.backend.type.BookStatusType;

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
}
