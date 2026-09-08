package com.rmr.backend.service.booksearch;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class IsbnUtilsTest {

	@Test
	void convertsIsbn10ToIsbn13() {
		assertEquals("9784062748681", IsbnUtils.toIsbn13("4062748687"));
	}

	@Test
	void keepsIsbn13AsIs() {
		assertEquals("9784062748681", IsbnUtils.toIsbn13("9784062748681"));
	}

	@Test
	void stripsHyphens() {
		assertEquals("9784062748681", IsbnUtils.toIsbn13("978-4-06-274868-1"));
		assertEquals("9784062748681", IsbnUtils.toIsbn13("4-06-274868-7"));
	}

	@Test
	void returnsNullForBlankOrInvalidInput() {
		assertNull(IsbnUtils.toIsbn13(null));
		assertNull(IsbnUtils.toIsbn13(""));
		assertNull(IsbnUtils.toIsbn13("12345"));
	}
}
