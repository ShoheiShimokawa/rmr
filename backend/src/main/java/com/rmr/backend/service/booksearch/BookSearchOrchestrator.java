package com.rmr.backend.service.booksearch;

import java.text.Normalizer;
import java.util.List;

import org.springframework.stereotype.Service;

/** クエリを正規化してプロバイダを呼び出す。 */
@Service
public class BookSearchOrchestrator {

    private final BookSearchProvider provider;

    public BookSearchOrchestrator(BookSearchProvider provider) {
        this.provider = provider;
    }

    public List<BookSearchResult> search(String query, BookSearchContext context) {
        return provider.search(normalize(query), context);
    }

    /** 全角/半角の表記ゆれを吸収するためNFKC正規化する。 */
    private String normalize(String query) {
        if (query == null) {
            return null;
        }
        return Normalizer.normalize(query, Normalizer.Form.NFKC);
    }
}
