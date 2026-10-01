package com.rmr.backend.service.booksearch;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class BookMatchKeysTest {

    @Test
    void isbnKeyReturnsNullForBlankIsbn() {
        assertThat(BookMatchKeys.isbnKey(null)).isNull();
        assertThat(BookMatchKeys.isbnKey("")).isNull();
        assertThat(BookMatchKeys.isbnKey("  ")).isNull();
    }

    @Test
    void isbnKeyIsStableForTheSameIsbn() {
        assertThat(BookMatchKeys.isbnKey("9784000000001")).isEqualTo(BookMatchKeys.isbnKey("9784000000001"));
    }

    @Test
    void titleAuthorKeyReturnsNullWhenTitleIsBlank() {
        assertThat(BookMatchKeys.titleAuthorKey(null, "Author")).isNull();
        assertThat(BookMatchKeys.titleAuthorKey("  ", "Author")).isNull();
    }

    @Test
    void titleAuthorKeyIgnoresFullWidthHalfWidthAndSymbolDifferences() {
        String a = BookMatchKeys.titleAuthorKey("はじめての Spring Boot!", "山田太郎");
        String b = BookMatchKeys.titleAuthorKey("はじめての spring boot", "山田太郎");

        assertThat(a).isEqualTo(b);
    }

    @Test
    void titleAuthorKeyDiffersForDifferentAuthors() {
        String a = BookMatchKeys.titleAuthorKey("Same Title", "Author A");
        String b = BookMatchKeys.titleAuthorKey("Same Title", "Author B");

        assertThat(a).isNotEqualTo(b);
    }

    @Test
    void titleAuthorKeyToleratesMissingAuthor() {
        assertThat(BookMatchKeys.titleAuthorKey("Title", null)).isEqualTo(BookMatchKeys.titleAuthorKey("Title", ""));
    }
}
