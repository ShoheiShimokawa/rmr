package com.rmr.backend.type;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class GenreTypeTest {

	@Test
	void classifyReturnsUnknownForNullGenre() {
		assertEquals(LargeGenreType.UNKNOWN, GenreType.classify(null));
	}

	@Test
	void classifyMapsFictionToFictionLargeGenre() {
		assertEquals(LargeGenreType.FICTION, GenreType.classify(GenreType.FICTION));
	}
}
