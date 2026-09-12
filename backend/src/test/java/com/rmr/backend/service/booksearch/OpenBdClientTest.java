package com.rmr.backend.service.booksearch;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
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

import com.rmr.backend.service.booksearch.OpenBdClient.OpenBdBook;

class OpenBdClientTest {

    private OpenBdClient clientWithResponse(String response) {
        RestTemplate restTemplate = mock(RestTemplate.class);
        when(restTemplate.getForObject(any(URI.class), eq(String.class))).thenReturn(response);
        return new OpenBdClient(restTemplate, "https://api.openbd.jp/v1/get");
    }

    @Test
    void mapsCoverAndDescription() {
        String response = """
                [
                  {"summary": {"isbn": "9784101010014", "title": "吾輩は猫である",
                    "author": "夏目,漱石,1867-1916", "cover": "https://cover.openbd.jp/9784101010014.jpg"},
                   "onix": {"CollateralDetail": {"TextContent": [
                     {"TextType": "02", "ContentAudience": "00", "Text": "短い紹介"},
                     {"TextType": "03", "ContentAudience": "00", "Text": " 猫の視点から人間社会を風刺した長編小説。 "}
                   ]}}}
                ]
                """;
        OpenBdClient client = clientWithResponse(response);

        Map<String, OpenBdBook> books = client.fetchBooks(List.of("9784101010014"));

        OpenBdBook book = books.get("9784101010014");
        assertEquals("https://cover.openbd.jp/9784101010014.jpg", book.cover());
        assertEquals("猫の視点から人間社会を風刺した長編小説。", book.description());
    }

    @Test
    void fallsBackToFirstNonEmptyTextWhenNoDescriptionType() {
        String response = """
                [
                  {"summary": {"isbn": "9784101010014", "cover": ""},
                   "onix": {"CollateralDetail": {"TextContent": [
                     {"TextType": "04", "Text": ""},
                     {"TextType": "02", "Text": "目次的な紹介"}
                   ]}}}
                ]
                """;
        OpenBdClient client = clientWithResponse(response);

        OpenBdBook book = client.fetchBooks(List.of("9784101010014")).get("9784101010014");

        assertNull(book.cover());
        assertEquals("目次的な紹介", book.description());
    }

    @Test
    void excludesIsbnWhenNeitherCoverNorDescriptionPresent() {
        String response = """
                [
                  {"summary": {"isbn": "9784101010014", "title": "吾輩は猫である", "cover": ""},
                   "onix": {"CollateralDetail": {}}}
                ]
                """;
        OpenBdClient client = clientWithResponse(response);

        assertTrue(client.fetchBooks(List.of("9784101010014")).isEmpty());
    }

    @Test
    void ignoresNullEntriesForUnknownIsbn() {
        String response = """
                [
                  {"summary": {"isbn": "9784101010014", "cover": "https://cover.openbd.jp/9784101010014.jpg"}},
                  null
                ]
                """;
        OpenBdClient client = clientWithResponse(response);

        Map<String, OpenBdBook> books = client.fetchBooks(List.of("9784101010014", "9999999999999"));

        assertEquals(1, books.size());
        assertEquals("https://cover.openbd.jp/9784101010014.jpg", books.get("9784101010014").cover());
        assertNull(books.get("9784101010014").description());
    }

    @Test
    void returnsEmptyMapForEmptyIsbnListOrBlankResponse() {
        assertTrue(clientWithResponse("[]").fetchBooks(List.of()).isEmpty());
        assertTrue(clientWithResponse("[]").fetchBooks(null).isEmpty());
        assertFalse(clientWithResponse("").fetchBooks(List.of("9784101010014")).containsKey("9784101010014"));
    }
}
