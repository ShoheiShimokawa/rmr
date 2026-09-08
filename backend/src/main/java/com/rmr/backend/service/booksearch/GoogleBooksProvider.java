package com.rmr.backend.service.booksearch;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class GoogleBooksProvider implements BookSearchProvider {

    private static final String PROVIDER_NAME = "GOOGLE_BOOKS";

    private final RestTemplate restTemplate;
    private final String googleBooksApiUrl;
    private final String apiKey;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GoogleBooksProvider(
            RestTemplate restTemplate,
            @Value("${google.books.api.url}") String googleBooksApiUrl,
            @Value("${google.books.api.key}") String apiKey) {
        this.restTemplate = restTemplate;
        this.googleBooksApiUrl = googleBooksApiUrl;
        this.apiKey = apiKey;
    }

    @Override
    public List<BookSearchResult> search(String query, BookSearchContext context) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(googleBooksApiUrl)
                .queryParam("q", query)
                .queryParam("maxResults", 40)
                .queryParam("key", apiKey);
        if (context != null && StringUtils.hasText(context.countryHint())) {
            builder.queryParam("country", context.countryHint());
        }
        if (context != null && StringUtils.hasText(context.languageHint())) {
            builder.queryParam("langRestrict", context.languageHint());
        }
        URI url = builder.build().encode().toUri();

        String rawBody = restTemplate.getForObject(url, String.class);
        return parse(rawBody);
    }

    private List<BookSearchResult> parse(String rawBody) {
        List<BookSearchResult> results = new ArrayList<>();
        if (!StringUtils.hasText(rawBody)) {
            return results;
        }
        JsonNode root;
        try {
            root = objectMapper.readTree(rawBody);
        } catch (Exception e) {
            return results;
        }
        for (JsonNode item : root.path("items")) {
            results.add(toResult(item));
        }
        return results;
    }

    private BookSearchResult toResult(JsonNode item) {
        JsonNode volumeInfo = item.path("volumeInfo");
        return new BookSearchResult(
                PROVIDER_NAME,
                textOrNull(item.path("id")),
                extractIsbn13(volumeInfo.path("industryIdentifiers")),
                textOrNull(volumeInfo.path("title")),
                null,
                firstOrNull(volumeInfo.path("authors")),
                null,
                textOrNull(volumeInfo.path("description")),
                textOrNull(volumeInfo.path("imageLinks").path("thumbnail")),
                textOrNull(volumeInfo.path("publishedDate")),
                firstOrNull(volumeInfo.path("categories")),
                textOrNull(volumeInfo.path("language")));
    }

    /** ISBN_13があればそれを、無ければISBN_10をISBN-13に変換して使う。どちらも無ければnull。 */
    private String extractIsbn13(JsonNode industryIdentifiers) {
        String isbn13 = null;
        String isbn10 = null;
        for (JsonNode identifier : industryIdentifiers) {
            String type = identifier.path("type").asText("");
            String value = textOrNull(identifier.path("identifier"));
            if ("ISBN_13".equals(type)) {
                isbn13 = value;
            } else if ("ISBN_10".equals(type)) {
                isbn10 = value;
            }
        }
        if (isbn13 != null) {
            return IsbnUtils.toIsbn13(isbn13);
        }
        if (isbn10 != null) {
            return IsbnUtils.toIsbn13(isbn10);
        }
        return null;
    }

    private String firstOrNull(JsonNode arrayNode) {
        if (arrayNode.isArray() && arrayNode.size() > 0) {
            return textOrNull(arrayNode.get(0));
        }
        return null;
    }

    private String textOrNull(JsonNode node) {
        return node.isMissingNode() || node.isNull() ? null : node.asText(null);
    }
}
