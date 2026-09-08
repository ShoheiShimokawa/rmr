package com.rmr.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rmr.backend.service.booksearch.BookSearchContext;
import com.rmr.backend.service.booksearch.BookSearchOrchestrator;
import com.rmr.backend.service.booksearch.BookSearchResult;

import lombok.RequiredArgsConstructor;

/** 本の検索エンドポイント。{@link BookSearchOrchestrator}に委譲する。 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/books")
public class BookSearchController {

    private final BookSearchOrchestrator orchestrator;

    @GetMapping
    public Map<String, List<BookSearchResult>> searchBooks(
            @RequestParam String query,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String langRestrict) {
        List<BookSearchResult> results = orchestrator.search(query, new BookSearchContext(langRestrict, country));
        return Map.of("items", results);
    }
}
