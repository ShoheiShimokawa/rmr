package com.rmr.backend.service.booksearch;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * openBD(https://openbd.jp/)からISBNをキーに書影URLと内容紹介をまとめて取得するクライアント。
 * openBDの利用規約上、書影・書誌情報は「本の紹介・販促目的」に限って利用できる。
 * 本サービスでは、検索結果に書影・内容紹介を表示する目的にのみ使用する。
 */
@Component
public class OpenBdClient {

    /** ONIX TextType: 03 = 内容紹介(Description)。 */
    private static final String TEXT_TYPE_DESCRIPTION = "03";

    private final RestTemplate restTemplate;
    private final String openBdApiUrl;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OpenBdClient(RestTemplate restTemplate, @Value("${openbd.api.url}") String openBdApiUrl) {
        this.restTemplate = restTemplate;
        this.openBdApiUrl = openBdApiUrl;
    }

    /** openBDから取得した1冊分の情報。無い項目はnull。 */
    public record OpenBdBook(String cover, String description) {
    }

    /**
     * 指定したISBN群の書影URLと内容紹介を1回のHTTP呼び出しでまとめて取得する
     * (openBDは1リクエストで複数ISBNをカンマ区切り指定できる)。
     *
     * @return ISBN(13桁) -&gt; 書籍情報 のMap。書影・内容紹介のどちらも無いISBNはキーごと含まない。
     */
    public Map<String, OpenBdBook> fetchBooks(List<String> isbns) {
        Map<String, OpenBdBook> books = new HashMap<>();
        if (isbns == null || isbns.isEmpty()) {
            return books;
        }

        URI url = UriComponentsBuilder.fromHttpUrl(openBdApiUrl)
                .queryParam("isbn", String.join(",", isbns))
                .build()
                .encode()
                .toUri();

        String rawBody = restTemplate.getForObject(url, String.class);
        if (!StringUtils.hasText(rawBody)) {
            return books;
        }

        JsonNode root;
        try {
            root = objectMapper.readTree(rawBody);
        } catch (Exception e) {
            return books;
        }
        if (!root.isArray()) {
            return books;
        }

        for (JsonNode item : root) {
            if (item == null || item.isNull()) {
                continue; // 該当データが無いISBNはnullエントリとして返ってくる
            }
            String isbn = textOrNull(item.path("summary").path("isbn"));
            String cover = textOrNull(item.path("summary").path("cover"));
            String description = extractDescription(item);
            if (isbn != null && (StringUtils.hasText(cover) || description != null)) {
                books.put(isbn, new OpenBdBook(StringUtils.hasText(cover) ? cover : null, description));
            }
        }
        return books;
    }

    /** onix.CollateralDetail.TextContent から内容紹介を取り出す。TextType=03 を優先し、無ければ最初の非空テキスト。 */
    private String extractDescription(JsonNode item) {
        JsonNode textContents = item.path("onix").path("CollateralDetail").path("TextContent");
        if (!textContents.isArray()) {
            return null;
        }
        String fallback = null;
        for (JsonNode textContent : textContents) {
            String text = textOrNull(textContent.path("Text"));
            if (!StringUtils.hasText(text)) {
                continue;
            }
            if (TEXT_TYPE_DESCRIPTION.equals(textOrNull(textContent.path("TextType")))) {
                return text.trim();
            }
            if (fallback == null) {
                fallback = text.trim();
            }
        }
        return fallback;
    }

    private String textOrNull(JsonNode node) {
        return node.isMissingNode() || node.isNull() ? null : node.asText(null);
    }
}
