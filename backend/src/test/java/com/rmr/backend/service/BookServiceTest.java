package com.rmr.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.rmr.backend.context.BookRepository;
import com.rmr.backend.model.Book;
import com.rmr.backend.model.Book.RegisterBook;

class BookServiceTest {

	@Test
	void registerReturnsExistingBookWhenIsbnAlreadyRegistered() {
		BookRepository rep = mock(BookRepository.class);
		Book existing = Book.builder().bookId(1).isbn("9784062748681").build();
		when(rep.findByIsbn("9784062748681")).thenReturn(Optional.of(existing));
		BookService service = new BookService(rep);

		RegisterBook param = RegisterBook.builder().id("google-id-2").isbn("9784062748681").build();
		Book result = service.register(param);

		assertEquals(existing, result);
		verify(rep, never()).findById(anyString());
		verify(rep, never()).save(any());
	}

	@Test
	void registerFallsBackToSourceIdWhenIsbnMissing() {
		BookRepository rep = mock(BookRepository.class);
		when(rep.findById("google-id")).thenReturn(Optional.empty());
		when(rep.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
		BookService service = new BookService(rep);

		RegisterBook param = RegisterBook.builder().id("google-id").isbn(null).title("t").build();
		service.register(param);

		verify(rep).findById("google-id");
		verify(rep, never()).findByIsbn(anyString());
	}

	@Test
	void registerFallsBackToSourceIdWhenIsbnNotFound() {
		BookRepository rep = mock(BookRepository.class);
		when(rep.findByIsbn("9784062748681")).thenReturn(Optional.empty());
		when(rep.findById("google-id")).thenReturn(Optional.empty());
		when(rep.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
		BookService service = new BookService(rep);

		RegisterBook param = RegisterBook.builder().id("google-id").isbn("9784062748681").title("t").build();
		service.register(param);

		verify(rep).findByIsbn("9784062748681");
		verify(rep).findById("google-id");
	}
}
