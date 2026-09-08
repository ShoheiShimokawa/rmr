package com.rmr.backend.service.booksearch;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.net.URI;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;

class GoogleBooksProviderTest {

	private static final String SAMPLE_RESPONSE = """
			{
			  "items": [
			    {
			      "id": "abc123",
			      "volumeInfo": {
			        "title": "ノルウェイの森",
			        "authors": ["村上春樹"],
			        "description": "...",
			        "publishedDate": "1987",
			        "categories": ["Fiction"],
			        "industryIdentifiers": [
			          {"type": "ISBN_10", "identifier": "4062748687"},
			          {"type": "ISBN_13", "identifier": "9784062748681"}
			        ],
			        "imageLinks": {"thumbnail": "https://example.com/thumb.jpg"},
			        "language": "ja"
			      }
			    }
			  ]
			}
			""";

	private GoogleBooksProvider providerWithResponse(String response) {
		RestTemplate restTemplate = mock(RestTemplate.class);
		when(restTemplate.getForObject(any(URI.class), eq(String.class))).thenReturn(response);
		return new GoogleBooksProvider(restTemplate, "https://example.com/books", "dummy-key");
	}

	@Test
	void mapsGoogleResponseToCanonicalResult() {
		GoogleBooksProvider provider = providerWithResponse(SAMPLE_RESPONSE);

		List<BookSearchResult> results = provider.search("ノルウェイの森", new BookSearchContext("ja", "JP"));

		assertEquals(1, results.size());
		BookSearchResult result = results.get(0);
		assertEquals("GOOGLE_BOOKS", result.provider());
		assertEquals("abc123", result.sourceId());
		assertEquals("9784062748681", result.isbn());
		assertEquals("ノルウェイの森", result.title());
		assertEquals("村上春樹", result.author());
		assertEquals("ja", result.language());
	}

	@Test
	void fallsBackToIsbn10ConvertedToIsbn13WhenIsbn13Missing() {
		String response = """
				{"items":[{"id":"x","volumeInfo":{"title":"t","industryIdentifiers":[
				{"type":"ISBN_10","identifier":"4062748687"}]}}]}
				""";
		GoogleBooksProvider provider = providerWithResponse(response);

		List<BookSearchResult> results = provider.search("t", new BookSearchContext(null, null));

		assertEquals("9784062748681", results.get(0).isbn());
	}

	@Test
	void isbnIsNullWhenNoIdentifiersPresent() {
		String response = """
				{"items":[{"id":"x","volumeInfo":{"title":"t"}}]}
				""";
		GoogleBooksProvider provider = providerWithResponse(response);

		List<BookSearchResult> results = provider.search("t", new BookSearchContext(null, null));

		assertEquals(null, results.get(0).isbn());
	}

	@Test
	void returnsEmptyListWhenNoItems() {
		GoogleBooksProvider provider = providerWithResponse("{}");

		List<BookSearchResult> results = provider.search("nothing", new BookSearchContext(null, null));

		assertTrue(results.isEmpty());
	}
}
