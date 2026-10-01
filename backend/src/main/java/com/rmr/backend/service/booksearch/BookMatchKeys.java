package com.rmr.backend.service.booksearch;

import java.text.Normalizer;
import java.util.regex.Pattern;

import org.springframework.util.StringUtils;

/**
 * 読書記録・検索結果に含まれる本を同一視するための正規化キーを組み立てる。
 * ISBNがあればISBNで、無ければ正規化したタイトル+著者で束ねる。
 */
public final class BookMatchKeys {

    private static final Pattern NORMALIZE_STRIP = Pattern.compile("[\\s\\p{P}\\p{S}]+");

    private BookMatchKeys() {
    }

    /** 全角/半角の表記ゆれを吸収し、記号・空白を除いて小文字化する。 */
    public static String normalize(String text) {
        if (!StringUtils.hasText(text)) {
            return "";
        }
        String nfkc = Normalizer.normalize(text, Normalizer.Form.NFKC);
        return NORMALIZE_STRIP.matcher(nfkc).replaceAll("").toLowerCase();
    }

    /** ISBNを束ねるキー。ISBNが無ければnullを返す。 */
    public static String isbnKey(String isbn) {
        if (!StringUtils.hasText(isbn)) {
            return null;
        }
        return "isbn:" + isbn.trim();
    }

    /** タイトル+著者を束ねるキー。タイトルが無ければnullを返す。 */
    public static String titleAuthorKey(String title, String author) {
        String normalizedTitle = normalize(title);
        if (normalizedTitle.isEmpty()) {
            return null;
        }
        return "ta:" + normalizedTitle + "|" + normalize(author);
    }
}
