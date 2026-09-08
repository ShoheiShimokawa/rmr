package com.rmr.backend.service.booksearch;

import java.util.List;

/** 書籍検索プロバイダの共通インターフェース。 */
public interface BookSearchProvider {

    List<BookSearchResult> search(String query, BookSearchContext context);
}
