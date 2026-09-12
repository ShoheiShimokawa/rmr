package com.rmr.backend.service.booksearch;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.util.StringUtils;

/**
 * NDLサーチの著者表記を、登録・表示用の「先頭1名の氏名」に整形する。
 * <ul>
 * <li>典拠形(foaf:name): "姓, 名, 生年-没年" → 和名は "姓名"、欧文名は "名 姓"</li>
 * <li>責任表示(dc:creator): "A, B [著]" / "A 著 ; C 訳" → 先頭の "A" から役割語を除いたもの</li>
 * </ul>
 */
final class NdlAuthorNames {

    private static final Pattern LIFE_DATES = Pattern.compile("^[0-9?\\-\\s]+$");
    private static final Pattern STATEMENT_SEPARATOR = Pattern.compile("\\s*[,;、;／/]\\s*");
    private static final Pattern ROLE_SUFFIX = Pattern.compile(
            "\\s*[\\[\\(（〔]?(共著|編著|監修|監訳|共訳|原作|原著|訳者|著者|編集|編者|漫画|イラスト|ほか|他|等|著|訳|編|作|画|絵|文|述|撰|校)[\\]\\)）〕]?\\s*$");
    private static final Pattern BRACKET_ONLY = Pattern.compile("\\s*[\\[\\(（〔][^\\]\\)）〕]*[\\]\\)）〕]\\s*$");
    private static final Pattern LATIN = Pattern.compile("^[\\p{IsLatin}\\p{Punct}\\s\\d]+$");

    private NdlAuthorNames() {
    }

    /** 典拠形の氏名から生没年を除き、和名は姓名を結合、欧文名は「名 姓」の順で返す。整形できなければnull。 */
    static String fromAuthorityName(String foafName) {
        List<String> parts = nameParts(foafName);
        if (parts.isEmpty()) {
            return null;
        }
        if (parts.size() >= 2 && LATIN.matcher(String.join(" ", parts)).matches()) {
            return parts.get(1) + " " + parts.get(0);
        }
        return String.join("", parts);
    }

    /** 典拠形の読みから生没年を除き、空白区切りで返す。 */
    static String readingFromTranscription(String transcription) {
        List<String> parts = nameParts(transcription);
        return parts.isEmpty() ? null : String.join(" ", parts);
    }

    /** 責任表示の先頭1名を取り出し、末尾の役割語や括弧書きを除いて返す。整形できなければnull。 */
    static String fromStatement(String statement) {
        if (!StringUtils.hasText(statement)) {
            return null;
        }
        String first = STATEMENT_SEPARATOR.split(statement.trim(), 2)[0];
        String previous;
        do {
            previous = first;
            first = ROLE_SUFFIX.matcher(first).replaceFirst("");
            first = BRACKET_ONLY.matcher(first).replaceFirst("");
        } while (!first.equals(previous));
        first = first.trim();
        return first.isEmpty() ? null : first;
    }

    private static List<String> nameParts(String name) {
        List<String> parts = new ArrayList<>();
        if (!StringUtils.hasText(name)) {
            return parts;
        }
        for (String part : name.split(",")) {
            String trimmed = part.trim();
            if (!trimmed.isEmpty() && !LIFE_DATES.matcher(trimmed).matches()) {
                parts.add(trimmed);
            }
        }
        return parts;
    }
}
