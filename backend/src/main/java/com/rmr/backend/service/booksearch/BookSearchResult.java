package com.rmr.backend.service.booksearch;

/**
 * プロバイダ非依存の本の検索結果。
 *
 * @param provider     取得元プロバイダ名 (例: "GOOGLE_BOOKS")
 * @param sourceId     プロバイダ内でのID
 * @param isbn         ISBN-13。取得できない場合はnull
 * @param title        タイトル
 * @param titleKana    タイトルの読み(カタカナ)
 * @param author       著者(先頭1名)
 * @param authorKana   著者の読み(カタカナ)
 * @param description  概要
 * @param thumbnail    サムネイル画像URL
 * @param publishedDate 出版日
 * @param genre        プロバイダ固有のジャンル/カテゴリ文字列
 * @param language     ISO 639-1言語コード
 */
public record BookSearchResult(
        String provider,
        String sourceId,
        String isbn,
        String title,
        String titleKana,
        String author,
        String authorKana,
        String description,
        String thumbnail,
        String publishedDate,
        String genre,
        String language) {
}
