package com.rmr.backend.service.booksearch;

/** ISBNをISBN-13に正規化するユーティリティ。 */
public final class IsbnUtils {

    private IsbnUtils() {
    }

    /** ハイフンなど、数字・チェックデジット以外の文字を取り除く。 */
    public static String clean(String isbn) {
        if (isbn == null) {
            return null;
        }
        return isbn.replaceAll("[^0-9Xx]", "");
    }

    /** ISBNを13桁に正規化する。10桁なら978プレフィックスでISBN-13に変換する。 */
    public static String toIsbn13(String isbn) {
        String cleaned = clean(isbn);
        if (cleaned == null || cleaned.isEmpty()) {
            return null;
        }
        if (cleaned.length() == 13) {
            return cleaned;
        }
        if (cleaned.length() == 10) {
            String first12 = "978" + cleaned.substring(0, 9);
            return first12 + computeIsbn13CheckDigit(first12);
        }
        return null;
    }

    private static int computeIsbn13CheckDigit(String first12Digits) {
        int sum = 0;
        for (int i = 0; i < 12; i++) {
            int digit = Character.getNumericValue(first12Digits.charAt(i));
            sum += (i % 2 == 0) ? digit : digit * 3;
        }
        int remainder = sum % 10;
        return remainder == 0 ? 0 : 10 - remainder;
    }
}
