package com.rmr.backend.service.booksearch;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class JapaneseTextUtilsTest {

    @Test
    void hiragana() {
        assertTrue(JapaneseTextUtils.containsJapanese("なつめそうせき"));
    }

    @Test
    void katakana() {
        assertTrue(JapaneseTextUtils.containsJapanese("ハリーポッター"));
    }

    @Test
    void kanji() {
        assertTrue(JapaneseTextUtils.containsJapanese("吾輩は猫である"));
    }

    @Test
    void halfWidthKatakana() {
        assertTrue(JapaneseTextUtils.containsJapanese("ﾅﾂﾒｿｳｾｷ"));
    }

    @Test
    void mixedJapaneseAndAscii() {
        assertTrue(JapaneseTextUtils.containsJapanese("Harry Potter 賢者の石"));
    }

    @Test
    void asciiOnly() {
        assertFalse(JapaneseTextUtils.containsJapanese("Harry Potter"));
    }

    @Test
    void nullInput() {
        assertFalse(JapaneseTextUtils.containsJapanese(null));
    }

    @Test
    void emptyInput() {
        assertFalse(JapaneseTextUtils.containsJapanese(""));
    }
}
