package com.rmr.backend.service.booksearch;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class NdlAuthorNamesTest {

    @Test
    void authorityNameJoinsJapaneseSurnameAndGivenNameWithoutLifeDates() {
        assertEquals("瀬戸内晴美", NdlAuthorNames.fromAuthorityName("瀬戸内, 晴美, 1922-2021"));
        assertEquals("みもとけいこ", NdlAuthorNames.fromAuthorityName("みもと, けいこ, 1953-"));
        assertEquals("夏目漱石", NdlAuthorNames.fromAuthorityName("夏目, 漱石, 1867-1916"));
        assertEquals("日本経済新聞社", NdlAuthorNames.fromAuthorityName("日本経済新聞社"));
    }

    @Test
    void authorityNameReordersLatinNames() {
        assertEquals("Oliver Burkeman", NdlAuthorNames.fromAuthorityName("Burkeman, Oliver, 1975-"));
        assertEquals("J. K. Rowling", NdlAuthorNames.fromAuthorityName("Rowling, J. K."));
    }

    @Test
    void readingDropsLifeDatesAndUsesSpaces() {
        assertEquals("セトウチ ハルミ", NdlAuthorNames.readingFromTranscription("セトウチ, ハルミ, 1922-2021"));
        assertEquals("キシミ イチロウ", NdlAuthorNames.readingFromTranscription("キシミ, イチロウ"));
        assertNull(NdlAuthorNames.readingFromTranscription(null));
    }

    @Test
    void statementKeepsFirstAuthorAndStripsRoles() {
        assertEquals("瀬戸内晴美", NdlAuthorNames.fromStatement("瀬戸内晴美, 前田愛 [著]"));
        assertEquals("みもとけいこ", NdlAuthorNames.fromStatement("みもとけいこ 著"));
        assertEquals("井上靖", NdlAuthorNames.fromStatement("井上靖, 三木卓, 安岡章太郎 著"));
        assertEquals("直野敦", NdlAuthorNames.fromStatement("直野敦 訳"));
        assertEquals("大石真", NdlAuthorNames.fromStatement("大石真 〔ほか〕文"));
        assertEquals("オリバー・バークマン", NdlAuthorNames.fromStatement("オリバー・バークマン 著 ; 高橋璃子 訳"));
        assertEquals("清水大吾", NdlAuthorNames.fromStatement("清水大吾著"));
        assertEquals("岸見一郎", NdlAuthorNames.fromStatement("岸見一郎, 古賀史健 著"));
    }

    @Test
    void statementReturnsNullWhenNothingRemains() {
        assertNull(NdlAuthorNames.fromStatement(null));
        assertNull(NdlAuthorNames.fromStatement("  "));
        assertNull(NdlAuthorNames.fromStatement("[著]"));
    }
}
