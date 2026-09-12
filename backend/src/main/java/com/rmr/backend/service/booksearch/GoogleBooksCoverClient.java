package com.rmr.backend.service.booksearch;

import java.net.URI;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Google Books Dynamic Links(jscmd=viewapi)からISBNをキーに書影URLをまとめて取得するクライアント。
 * APIキー不要で、複数ISBNを1リクエストで問い合わせられる。
 * レスポンスは {@code var _GBSBookInfo = {...};} 形式のJavaScriptで返るため、JSON部分だけを切り出して解析する。
 */
@Component
public class GoogleBooksCoverClient {

    private static final String BIBKEY_PREFIX = "ISBN:";

    private final RestTemplate restTemplate;
    private final String dynamicLinksUrl;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GoogleBooksCoverClient(
            RestTemplate restTemplate,
            @Value("${google.books.dynamic-links.url}") String dynamicLinksUrl) {
        this.restTemplate = restTemplate;
        this.dynamicLinksUrl = dynamicLinksUrl;
    }

    /**
     * 指定したISBN群の書影URLを1回のHTTP呼び出しでまとめて取得する。
     *
     * @return ISBN(13桁) -&gt; 書影URL のMap。書影が無い/取得できなかったISBNはキーごと含まない。
     */
    public Map<String, String> fetchThumbnails(List<String> isbns) {
        Map<String, String> thumbnails = new HashMap<>();
        if (isbns == null || isbns.isEmpty()) {
            return thumbnails;
        }

        String bibkeys = isbns.stream()
                .map(isbn -> BIBKEY_PREFIX + isbn)
                .collect(Collectors.joining(","));
        URI url = UriComponentsBuilder.fromHttpUrl(dynamicLinksUrl)
                .queryParam("jscmd", "viewapi")
                .queryParam("bibkeys", bibkeys)
                .build()
                .encode()
                .toUri();

        String rawBody = restTemplate.getForObject(url, String.class);
        JsonNode root = parseJsonObject(rawBody);
        if (root == null) {
            return thumbnails;
        }

        Iterator<Map.Entry<String, JsonNode>> fields = root.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();
            String key = entry.getKey();
            String thumbnailUrl = textOrNull(entry.getValue().path("thumbnail_url"));
            if (key.startsWith(BIBKEY_PREFIX) && StringUtils.hasText(thumbnailUrl)) {
                thumbnails.put(key.substring(BIBKEY_PREFIX.length()), thumbnailUrl);
            }
        }
        return thumbnails;
    }

    /** JavaScript形式のレスポンスから、最初の '{' から最後の '}' までをJSONオブジェクトとして解析する。 */
    private JsonNode parseJsonObject(String rawBody) {
        if (!StringUtils.hasText(rawBody)) {
            return null;
        }
        int start = rawBody.indexOf('{');
        int end = rawBody.lastIndexOf('}');
        if (start < 0 || end <= start) {
            return null;
        }
        try {
            JsonNode root = objectMapper.readTree(rawBody.substring(start, end + 1));
            return root.isObject() ? root : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String textOrNull(JsonNode node) {
        return node.isMissingNode() || node.isNull() ? null : node.asText(null);
    }
}
