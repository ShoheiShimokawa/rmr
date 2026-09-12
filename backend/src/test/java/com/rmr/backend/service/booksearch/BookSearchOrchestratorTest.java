package com.rmr.backend.service.booksearch;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClientException;

import com.rmr.backend.service.booksearch.OpenBdClient.OpenBdBook;

class BookSearchOrchestratorTest {

    private static final BookSearchResult NDL_RESULT = new BookSearchResult(
            "NDL_SEARCH", "ndl-1", "9784101010014", "吾輩は猫である", "ワガハイハネコデアル",
            "夏目漱石", "ナツメソウセキ", null, null, "1905", null, "ja");

    private static final BookSearchResult GOOGLE_RESULT = new BookSearchResult(
            "GOOGLE_BOOKS", "google-1", "9780439708180", "Harry Potter", null,
            "J.K. Rowling", null, "desc", "https://example.com/thumb.jpg", "1997", "Fiction", "en");

    private BookSearchProvider ndlProvider;
    private BookSearchProvider googleBooksProvider;
    private OpenBdClient openBdClient;
    private GoogleBooksCoverClient googleBooksCoverClient;
    private BookSearchOrchestrator orchestrator;

    private void setUp() {
        ndlProvider = mock(BookSearchProvider.class);
        googleBooksProvider = mock(BookSearchProvider.class);
        openBdClient = mock(OpenBdClient.class);
        googleBooksCoverClient = mock(GoogleBooksCoverClient.class);
        orchestrator = new BookSearchOrchestrator(ndlProvider, googleBooksProvider, openBdClient, googleBooksCoverClient, Runnable::run, 2000);
    }

    @Test
    void japaneseQueryPrefersNdlAndDoesNotCallGoogleBooks() {
        setUp();
        when(ndlProvider.search(anyString(), any())).thenReturn(List.of(NDL_RESULT));
        when(openBdClient.fetchBooks(anyList())).thenReturn(Map.of());

        List<BookSearchResult> results = orchestrator.search("夏目漱石", new BookSearchContext(null, null));

        assertEquals(1, results.size());
        assertEquals("NDL_SEARCH", results.get(0).provider());
        verify(googleBooksProvider, never()).search(anyString(), any());
    }

    @Test
    void fallsBackToGoogleBooksWhenNdlReturnsEmpty() {
        setUp();
        when(ndlProvider.search(anyString(), any())).thenReturn(List.of());
        when(googleBooksProvider.search(anyString(), any())).thenReturn(List.of(GOOGLE_RESULT));

        List<BookSearchResult> results = orchestrator.search("夏目漱石", new BookSearchContext(null, null));

        assertEquals(1, results.size());
        assertEquals("GOOGLE_BOOKS", results.get(0).provider());
        // Google Books採用時は書影補完を行わない
        verify(openBdClient, never()).fetchBooks(anyList());
        verify(googleBooksCoverClient, never()).fetchThumbnails(anyList());
    }

    @Test
    void englishQueryPrefersGoogleBooksAndDoesNotCallNdl() {
        setUp();
        when(googleBooksProvider.search(anyString(), any())).thenReturn(List.of(GOOGLE_RESULT));

        List<BookSearchResult> results = orchestrator.search("Harry Potter", new BookSearchContext(null, null));

        assertEquals(1, results.size());
        assertEquals("GOOGLE_BOOKS", results.get(0).provider());
        verify(ndlProvider, never()).search(anyString(), any());
    }

    @Test
    void languageHintPrefersNdlEvenForRomajiQuery() {
        setUp();
        when(ndlProvider.search(anyString(), any())).thenReturn(List.of(NDL_RESULT));
        when(openBdClient.fetchBooks(anyList())).thenReturn(Map.of());

        List<BookSearchResult> results = orchestrator.search("natsume soseki", new BookSearchContext("ja", "JP"));

        assertEquals("NDL_SEARCH", results.get(0).provider());
        verify(googleBooksProvider, never()).search(anyString(), any());
    }

    @Test
    void fallsBackToNdlWhenGoogleBooksEmptyAndEnrichesWithThumbnail() {
        setUp();
        when(googleBooksProvider.search(anyString(), any())).thenReturn(List.of());
        when(ndlProvider.search(anyString(), any())).thenReturn(List.of(NDL_RESULT));
        when(openBdClient.fetchBooks(List.of("9784101010014")))
                .thenReturn(Map.of("9784101010014", new OpenBdBook("https://cover.openbd.jp/9784101010014.jpg", null)));

        List<BookSearchResult> results = orchestrator.search("Harry Potter", new BookSearchContext(null, null));

        assertEquals(1, results.size());
        assertEquals("NDL_SEARCH", results.get(0).provider());
        assertEquals("https://cover.openbd.jp/9784101010014.jpg", results.get(0).thumbnail());
    }

    @Test
    void primaryProviderExceptionTriggersFallback() {
        setUp();
        when(ndlProvider.search(anyString(), any())).thenThrow(new RestClientException("timeout"));
        when(googleBooksProvider.search(anyString(), any())).thenReturn(List.of(GOOGLE_RESULT));

        List<BookSearchResult> results = orchestrator.search("夏目漱石", new BookSearchContext(null, null));

        assertEquals(1, results.size());
        assertEquals("GOOGLE_BOOKS", results.get(0).provider());
    }

    @Test
    void coverLookupFailuresStillReturnSearchResultsWithoutThumbnail() {
        setUp();
        when(ndlProvider.search(anyString(), any())).thenReturn(List.of(NDL_RESULT));
        when(openBdClient.fetchBooks(anyList())).thenThrow(new RestClientException("timeout"));
        when(googleBooksCoverClient.fetchThumbnails(anyList())).thenThrow(new RestClientException("timeout"));

        List<BookSearchResult> results = orchestrator.search("夏目漱石", new BookSearchContext(null, null));

        assertEquals(1, results.size());
        assertEquals(null, results.get(0).thumbnail());
    }

    @Test
    void openBdCoverTakesPrecedenceOverGoogleAndBothSourcesAreQueriedOnce() {
        setUp();
        BookSearchResult second = new BookSearchResult(
                "NDL_SEARCH", "ndl-2", "9784103048718", "こころ", null, "夏目漱石", null, null, null, "1914", null, "ja");
        when(ndlProvider.search(anyString(), any())).thenReturn(List.of(NDL_RESULT, second));
        when(openBdClient.fetchBooks(List.of("9784101010014", "9784103048718")))
                .thenReturn(Map.of("9784101010014", new OpenBdBook("https://cover.openbd.jp/9784101010014.jpg", null)));
        when(googleBooksCoverClient.fetchThumbnails(List.of("9784101010014", "9784103048718")))
                .thenReturn(Map.of(
                        "9784101010014", "https://books.google.com/books/content?id=a&img=1",
                        "9784103048718", "https://books.google.com/books/content?id=x&img=1"));

        List<BookSearchResult> results = orchestrator.search("夏目漱石", new BookSearchContext(null, null));

        assertEquals("https://cover.openbd.jp/9784101010014.jpg", results.get(0).thumbnail());
        assertEquals("https://books.google.com/books/content?id=x&img=1", results.get(1).thumbnail());
        verify(openBdClient, times(1)).fetchBooks(anyList());
        verify(googleBooksCoverClient, times(1)).fetchThumbnails(anyList());
    }

    @Test
    void repeatedJapaneseQueryIsServedFromCache() {
        setUp();
        when(ndlProvider.search(anyString(), any())).thenReturn(List.of(NDL_RESULT));
        when(openBdClient.fetchBooks(anyList())).thenReturn(Map.of());
        when(googleBooksCoverClient.fetchThumbnails(anyList())).thenReturn(Map.of());

        List<BookSearchResult> first = orchestrator.search("夏目漱石", new BookSearchContext(null, null));
        List<BookSearchResult> second = orchestrator.search("夏目漱石", new BookSearchContext(null, null));

        assertEquals(first, second);
        verify(ndlProvider, times(1)).search(anyString(), any());
        verify(openBdClient, times(1)).fetchBooks(anyList());
    }

    @Test
    void openBdDescriptionFillsMissingDescriptionOnly() {
        setUp();
        BookSearchResult withDescription = new BookSearchResult(
                "NDL_SEARCH", "ndl-3", "9784103048718", "こころ", null, "夏目漱石", null, "既存の概要", null, "1914", null, "ja");
        when(ndlProvider.search(anyString(), any())).thenReturn(List.of(NDL_RESULT, withDescription));
        when(openBdClient.fetchBooks(anyList())).thenReturn(Map.of(
                "9784101010014", new OpenBdBook(null, "openBDの内容紹介"),
                "9784103048718", new OpenBdBook(null, "上書きされない紹介")));
        when(googleBooksCoverClient.fetchThumbnails(anyList())).thenReturn(Map.of());

        List<BookSearchResult> results = orchestrator.search("夏目漱石", new BookSearchContext(null, null));

        assertEquals("openBDの内容紹介", results.get(0).description());
        assertEquals("既存の概要", results.get(1).description());
        assertEquals(null, results.get(0).thumbnail());
    }

    @Test
    void slowNdlTriggersHedgedGoogleSearchAndGoogleResultIsUsedWhenNdlIsEmpty() throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(3);
        try {
            ndlProvider = mock(BookSearchProvider.class);
            googleBooksProvider = mock(BookSearchProvider.class);
            openBdClient = mock(OpenBdClient.class);
            googleBooksCoverClient = mock(GoogleBooksCoverClient.class);
            orchestrator = new BookSearchOrchestrator(ndlProvider, googleBooksProvider, openBdClient, googleBooksCoverClient, pool, 50);
            when(ndlProvider.search(anyString(), any())).thenAnswer(inv -> {
                Thread.sleep(300);
                return List.of();
            });
            when(googleBooksProvider.search(anyString(), any())).thenReturn(List.of(GOOGLE_RESULT));

            List<BookSearchResult> results = orchestrator.search("夏目漱石", new BookSearchContext(null, null));

            assertEquals("GOOGLE_BOOKS", results.get(0).provider());
            verify(googleBooksProvider, times(1)).search(anyString(), any());
        } finally {
            pool.shutdownNow();
        }
    }

    @Test
    void slowButSuccessfulNdlStillWinsOverHedgedGoogle() throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(3);
        try {
            ndlProvider = mock(BookSearchProvider.class);
            googleBooksProvider = mock(BookSearchProvider.class);
            openBdClient = mock(OpenBdClient.class);
            googleBooksCoverClient = mock(GoogleBooksCoverClient.class);
            orchestrator = new BookSearchOrchestrator(ndlProvider, googleBooksProvider, openBdClient, googleBooksCoverClient, pool, 50);
            when(ndlProvider.search(anyString(), any())).thenAnswer(inv -> {
                Thread.sleep(300);
                return List.of(NDL_RESULT);
            });
            when(googleBooksProvider.search(anyString(), any())).thenReturn(List.of(GOOGLE_RESULT));
            when(openBdClient.fetchBooks(anyList())).thenReturn(Map.of());
            when(googleBooksCoverClient.fetchThumbnails(anyList())).thenReturn(Map.of());

            List<BookSearchResult> results = orchestrator.search("夏目漱石", new BookSearchContext(null, null));

            assertEquals("NDL_SEARCH", results.get(0).provider());
        } finally {
            pool.shutdownNow();
        }
    }

    @Test
    void fallbackResultIsCachedToo() {
        setUp();
        when(ndlProvider.search(anyString(), any())).thenReturn(List.of());
        when(googleBooksProvider.search(anyString(), any())).thenReturn(List.of(GOOGLE_RESULT));

        orchestrator.search("夏目漱石", new BookSearchContext(null, null));
        orchestrator.search("夏目漱石", new BookSearchContext(null, null));

        verify(ndlProvider, times(1)).search(anyString(), any());
        verify(googleBooksProvider, times(1)).search(anyString(), any());
    }

    @Test
    void bothProvidersEmptyReturnsEmptyList() {
        setUp();
        when(ndlProvider.search(anyString(), any())).thenReturn(List.of());
        when(googleBooksProvider.search(anyString(), any())).thenReturn(List.of());

        List<BookSearchResult> results = orchestrator.search("該当なし", new BookSearchContext(null, null));

        assertTrue(results.isEmpty());
        verify(ndlProvider, times(1)).search(anyString(), any());
        verify(googleBooksProvider, times(1)).search(anyString(), any());
    }
}
