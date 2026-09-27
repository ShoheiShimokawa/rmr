package com.rmr.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;

import com.rmr.backend.context.BookRepository;
import com.rmr.backend.model.Book;
import com.rmr.backend.model.Book.RegisterBook;
import com.rmr.backend.type.SuggestionType;

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

	@Test
	void suggestReturnsEmptyListForBlankQuery() {
		BookRepository rep = mock(BookRepository.class);
		BookService service = new BookService(rep);

		List<Book.Suggestion> result = service.suggest("   ");

		assertEquals(List.of(), result);
		verify(rep, never()).findTitleSuggestions(anyString(), any());
		verify(rep, never()).findAuthorSuggestions(anyString(), any());
	}

	@Test
	void suggestReturnsEmptyListForTooLongQuery() {
		BookRepository rep = mock(BookRepository.class);
		BookService service = new BookService(rep);

		List<Book.Suggestion> result = service.suggest("a".repeat(51));

		assertEquals(List.of(), result);
		verify(rep, never()).findTitleSuggestions(anyString(), any());
	}

	@Test
	void suggestNormalizesFullWidthCharactersAndEscapesLikeWildcards() {
		BookRepository rep = mock(BookRepository.class);
		when(rep.findTitleSuggestions(anyString(), any())).thenReturn(List.of());
		when(rep.findAuthorSuggestions(anyString(), any())).thenReturn(List.of());
		BookService service = new BookService(rep);

		service.suggest("１００％");

		verify(rep).findTitleSuggestions(eq("100\\%"), any());
		verify(rep).findAuthorSuggestions(eq("100\\%"), any());
	}

	@Test
	void suggestOrdersTitleSuggestionsBeforeAuthorSuggestionsAndDedupesCase() {
		BookRepository rep = mock(BookRepository.class);
		when(rep.findTitleSuggestions(anyString(), any()))
				.thenReturn(List.of("Harry Potter", "harry potter", "Harry Potter and the Chamber of Secrets"));
		when(rep.findAuthorSuggestions(anyString(), any())).thenReturn(List.of("J.K. Rowling"));
		BookService service = new BookService(rep);

		List<Book.Suggestion> result = service.suggest("harry");

		assertEquals(
				List.of(
						new Book.Suggestion(SuggestionType.TITLE, "Harry Potter"),
						new Book.Suggestion(SuggestionType.TITLE, "Harry Potter and the Chamber of Secrets"),
						new Book.Suggestion(SuggestionType.AUTHOR, "J.K. Rowling")),
				result);
	}

	@Test
	void suggestCapsSuggestionsAfterDedupingFetchedRows() {
		BookRepository rep = mock(BookRepository.class);
		List<String> eightDistinctTitles = List.of("a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8");
		when(rep.findTitleSuggestions(anyString(), any())).thenReturn(eightDistinctTitles);
		when(rep.findAuthorSuggestions(anyString(), any())).thenReturn(List.of());
		BookService service = new BookService(rep);

		List<Book.Suggestion> result = service.suggest("a");

		assertEquals(6, result.size());
	}

	@Test
	void suggestFetchesMoreRowsThanItDisplaysToLeaveRoomForDeduping() {
		BookRepository rep = mock(BookRepository.class);
		when(rep.findTitleSuggestions(anyString(), any())).thenReturn(List.of());
		when(rep.findAuthorSuggestions(anyString(), any())).thenReturn(List.of());
		BookService service = new BookService(rep);

		service.suggest("harry");

		verify(rep).findTitleSuggestions(eq("harry"), argThat((Pageable p) -> p.getPageSize() == 20));
		verify(rep).findAuthorSuggestions(eq("harry"), argThat((Pageable p) -> p.getPageSize() == 10));
	}
}
