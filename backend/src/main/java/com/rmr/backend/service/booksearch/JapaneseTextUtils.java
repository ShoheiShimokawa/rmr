package com.rmr.backend.service.booksearch;

/** クエリ文字列に日本語（ひらがな・カタカナ・漢字・半角カナ）が含まれるかを判定する。 */
public final class JapaneseTextUtils {

    private JapaneseTextUtils() {
    }

    public static boolean containsJapanese(String text) {
        if (text == null) {
            return false;
        }
        return text.codePoints().anyMatch(JapaneseTextUtils::isJapaneseCodePoint);
    }

    private static boolean isJapaneseCodePoint(int cp) {
        return (cp >= 0x3040 && cp <= 0x309F)   // ひらがな
                || (cp >= 0x30A0 && cp <= 0x30FF)   // カタカナ
                || (cp >= 0x4E00 && cp <= 0x9FFF)   // CJK統合漢字
                || (cp >= 0xFF66 && cp <= 0xFF9D);  // 半角カナ
    }
}
