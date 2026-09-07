package com.rmr.backend.controller;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/books")
public class GBController {

    @Value("${google.books.api.url}")
    private String googleBooksApiUrl;

    @Value("${google.books.api.key}")
    private String apiKey;


    @GetMapping
    public ResponseEntity<?> searchBooks(
            @RequestParam String query,
            @RequestParam String country,
            @RequestParam(required = false) String langRestrict) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(googleBooksApiUrl)
                .queryParam("q", query)
                .queryParam("maxResults", 40)
                .queryParam("country", country)
                .queryParam("key", apiKey);
        // 言語で絞り込みたい場合のみ指定。country(閲覧可否・入手可能地域の情報)は
        // 言語ランキングには影響しないため、言語を絞るにはlangRestrictが別途必要。
        if (StringUtils.hasText(langRestrict)) {
            builder.queryParam("langRestrict", langRestrict);
        }
        URI url = builder.build().encode().toUri();

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        return ResponseEntity.ok(response.getBody());
    }
}
