package com.rmr.backend.service.booksearch;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;

class GoogleBooksCoverClientTest {

    // 実際のDynamic Linksレスポンス(callbackなし)を元にした簡略フィクスチャ。
    private static final String SAMPLE_RESPONSE = """
            var _GBSBookInfo = {"ISBN:9784103048718":{"bib_key":"ISBN:9784103048718",
            "info_url":"https://books.google.com/books?id=2cRFPQAACAAJ\\u0026source=gbs_ViewAPI",
            "thumbnail_url":"https://books.google.com/books/content?id=2cRFPQAACAAJ\\u0026printsec=frontcover\\u0026img=1\\u0026zoom=5",
            "preview":"noview"},
            "ISBN:9784041265512":{"bib_key":"ISBN:9784041265512",
            "info_url":"https://books.google.com/books?id=h27SAQAACAAJ\\u0026source=gbs_ViewAPI",
            "preview":"noview"}};
            """;

    private GoogleBooksCoverClient clientWithResponse(String response) {
        RestTemplate restTemplate = mock(RestTemplate.class);
        when(restTemplate.getForObject(any(URI.class), eq(String.class))).thenReturn(response);
        return new GoogleBooksCoverClient(restTemplate, "https://books.google.com/books");
    }

    @Test
    void mapsIsbnToThumbnailUrlAndUnescapesJson() {
        GoogleBooksCoverClient client = clientWithResponse(SAMPLE_RESPONSE);

        Map<String, String> thumbnails = client.fetchThumbnails(List.of("9784103048718", "9784041265512"));

        assertEquals(1, thumbnails.size());
        assertEquals(
                "https://books.google.com/books/content?id=2cRFPQAACAAJ&printsec=frontcover&img=1&zoom=5",
                thumbnails.get("9784103048718"));
    }

    @Test
    void excludesEntriesWithoutThumbnailUrl() {
        GoogleBooksCoverClient client = clientWithResponse(SAMPLE_RESPONSE);

        Map<String, String> thumbnails = client.fetchThumbnails(List.of("9784041265512"));

        assertFalse(thumbnails.containsKey("9784041265512"));
    }

    @Test
    void parsesJsonpCallbackFormToo() {
        String response = """
                cb({"ISBN:9784103048718":{"thumbnail_url":"https://example.com/cover.jpg"}});
                """;
        GoogleBooksCoverClient client = clientWithResponse(response);

        assertEquals("https://example.com/cover.jpg", client.fetchThumbnails(List.of("9784103048718")).get("9784103048718"));
    }

    @Test
    void returnsEmptyMapWhenNoBookMatches() {
        GoogleBooksCoverClient client = clientWithResponse("var _GBSBookInfo = {};");

        assertTrue(client.fetchThumbnails(List.of("9784103048718")).isEmpty());
    }

    @Test
    void returnsEmptyMapForEmptyIsbnList() {
        GoogleBooksCoverClient client = clientWithResponse("var _GBSBookInfo = {};");

        assertTrue(client.fetchThumbnails(List.of()).isEmpty());
        assertTrue(client.fetchThumbnails(null).isEmpty());
    }

    @Test
    void returnsEmptyMapOnBlankOrMalformedResponse() {
        assertTrue(clientWithResponse("").fetchThumbnails(List.of("9784103048718")).isEmpty());
        assertTrue(clientWithResponse("var _GBSBookInfo = {not json").fetchThumbnails(List.of("9784103048718")).isEmpty());
        assertTrue(clientWithResponse("var _GBSBookInfo = [];").fetchThumbnails(List.of("9784103048718")).isEmpty());
    }
}
