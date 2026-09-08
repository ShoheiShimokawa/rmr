package com.rmr.backend.service.booksearch;

/**
 * 検索リクエストに付随するヒント情報。プロバイダの選択やクエリの組み立てに使う。
 *
 * @param languageHint 優先したい言語コード(例: "ja")。未指定ならnull
 * @param countryHint  地域コード(例: "JP")。未指定ならnull
 */
public record BookSearchContext(String languageHint, String countryHint) {
}
