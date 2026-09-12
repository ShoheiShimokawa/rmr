package com.rmr.backend.service.booksearch;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Function;

import org.junit.jupiter.api.Test;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

class NdlSearchProviderTest {

    private static final String NO_RECORDS = """
            <searchRetrieveResponse xmlns="http://www.loc.gov/zing/srw/">
              <diagnostics>
                <diagnostic xmlns="http://www.loc.gov/zing/srw/diagnostic/">
                  <uri>info:srw/diagnostic/1/1</uri>
                  <details>An error occurred</details>
                  <message>Record does not exist</message>
                </diagnostic>
              </diagnostics>
            </searchRetrieveResponse>
            """;

    /** 実際のNDLサーチSRUレスポンス(recordPacking=xml, onlyBib=true)を元にしたレコード断片を組み立てる。 */
    private static String record(String id, String title, String titleKana, String creator, String creatorKana,
            String isbn, String year, String lang, String ndc) {
        StringBuilder sb = new StringBuilder();
        sb.append("<record><recordSchema>dcndl</recordSchema><recordPacking>xml</recordPacking><recordData>");
        sb.append("<rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\"")
          .append(" xmlns:dcterms=\"http://purl.org/dc/terms/\" xmlns:dcndl=\"http://ndl.go.jp/dcndl/terms/\" xmlns:foaf=\"http://xmlns.com/foaf/0.1/\">");
        sb.append("<dcndl:BibResource rdf:about=\"https://ndlsearch.ndl.go.jp/books/").append(id).append("#material\">");
        if (isbn != null) {
            sb.append("<dcterms:identifier rdf:datatype=\"http://ndl.go.jp/dcndl/terms/ISBN\">").append(isbn).append("</dcterms:identifier>");
        }
        sb.append("<dcterms:title>").append(title).append("</dcterms:title>");
        if (titleKana != null) {
            sb.append("<dc:title><rdf:Description><rdf:value>").append(title).append("</rdf:value>")
              .append("<dcndl:transcription>").append(titleKana).append("</dcndl:transcription></rdf:Description></dc:title>");
        }
        if (creator != null) {
            sb.append("<dcterms:creator><foaf:Agent><foaf:name>").append(creator).append("</foaf:name>");
            if (creatorKana != null) {
                sb.append("<dcndl:transcription>").append(creatorKana).append("</dcndl:transcription>");
            }
            sb.append("</foaf:Agent></dcterms:creator><dc:creator>").append(creator).append(" 著</dc:creator>");
        }
        if (year != null) {
            sb.append("<dcterms:issued rdf:datatype=\"http://purl.org/dc/terms/W3CDTF\">").append(year).append("</dcterms:issued>");
        }
        if (ndc != null) {
            sb.append("<dcterms:subject rdf:resource=\"http://id.ndl.go.jp/class/ndc10/").append(ndc).append("\"/>");
        }
        if (lang != null) {
            sb.append("<dcterms:language rdf:datatype=\"http://purl.org/dc/terms/ISO639-2\">").append(lang).append("</dcterms:language>");
        }
        sb.append("</dcndl:BibResource></rdf:RDF></recordData><recordPosition>1</recordPosition></record>");
        return sb.toString();
    }

    private static String envelope(int total, String... records) {
        return "<searchRetrieveResponse xmlns=\"http://www.loc.gov/zing/srw/\"><version>1.2</version>"
                + "<numberOfRecords>" + total + "</numberOfRecords><records>" + String.join("", records)
                + "</records></searchRetrieveResponse>";
    }

    private static final String KIRAWARERU = record("R1", "嫌われる勇気 : 自己啓発の源流「アドラー」の教え", "キラワレル ユウキ",
            "岸見, 一郎", "キシミ, イチロウ", "978-4-478-02581-9", "2013", "jpn", "146.1");
    private static final String ADLER_INTRO = record("R2", "アドラー心理学入門", "アドラー シンリガク ニュウモン",
            "岸見, 一郎", null, "4-584-20061-3", "1999", "jpn", "146.1");

    /** リクエストURLのクエリ内容に応じてレスポンスを返すRestTemplateモック。 */
    private RestTemplate restTemplateAnswering(Function<String, String> responseByDecodedQuery) {
        RestTemplate restTemplate = mock(RestTemplate.class);
        when(restTemplate.getForObject(any(URI.class), eq(String.class))).thenAnswer(invocation -> {
            URI uri = invocation.getArgument(0);
            String decoded = URLDecoder.decode(uri.getRawQuery(), StandardCharsets.UTF_8);
            return responseByDecodedQuery.apply(decoded);
        });
        return restTemplate;
    }

    private NdlSearchProvider provider(RestTemplate restTemplate) {
        return new NdlSearchProvider(restTemplate, Runnable::run, "https://ndlsearch.ndl.go.jp/api/sru", 20, 2, 10_000);
    }

    private static String sleepThen(long millis, String response) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return response;
    }

    @Test
    void exactTitleMatchIsRankedFirstAndStopsAfterOneCall() {
        RestTemplate restTemplate = restTemplateAnswering(q -> {
            if (q.contains("query=title=")) {
                return envelope(2, ADLER_INTRO, KIRAWARERU);
            }
            throw new AssertionError("unexpected request: " + q);
        });

        List<BookSearchResult> results = provider(restTemplate).search("嫌われる勇気", new BookSearchContext("ja", "JP"));

        assertEquals(2, results.size());
        BookSearchResult top = results.get(0);
        assertEquals("嫌われる勇気 : 自己啓発の源流「アドラー」の教え", top.title());
        assertEquals("NDL_SEARCH", top.provider());
        assertEquals("https://ndlsearch.ndl.go.jp/books/R1#material", top.sourceId());
        assertEquals("9784478025819", top.isbn());
        assertEquals("キラワレル ユウキ", top.titleKana());
        assertEquals("岸見一郎", top.author());
        assertEquals("キシミ イチロウ", top.authorKana());
        assertEquals("2013", top.publishedDate());
        assertEquals("ja", top.language());
        assertEquals("Psychology", top.genre());
        verify(restTemplate, times(1)).getForObject(any(URI.class), eq(String.class));
    }

    @Test
    void queriesCreatorWhenTitleHasNoPrefixMatchAndRanksAuthorBooksFirst() {
        String aboutAuthor = record("R10", "1冊でわかる村上春樹", null, "佐藤, 太郎", null, "978-4-00-000001-3", "2015", "jpn", "910.268");
        String byAuthor = record("R11", "ノルウェイの森", null, "村上, 春樹", null, "978-4-06-274868-1", "1987", "jpn", "913.6");
        RestTemplate restTemplate = restTemplateAnswering(q -> {
            if (q.contains("query=title=")) {
                return envelope(1, aboutAuthor);
            }
            if (q.contains("query=creator=")) {
                return envelope(1, byAuthor);
            }
            throw new AssertionError("unexpected request: " + q);
        });

        List<BookSearchResult> results = provider(restTemplate).search("村上春樹", new BookSearchContext(null, null));

        assertEquals(2, results.size());
        assertEquals("ノルウェイの森", results.get(0).title());
        assertEquals("Fiction", results.get(0).genre());
        assertEquals("1冊でわかる村上春樹", results.get(1).title());
        verify(restTemplate, times(2)).getForObject(any(URI.class), eq(String.class));
    }

    @Test
    void huntsRemainingTitlePageWhenCreatorEmptyAndTotalWithinLimit() {
        String derivative = record("R20", "贋作吾輩は猫である", null, "内田, 百閒", null, "978-4-00-000002-0", "2003", "jpn", "913.6");
        String original = record("R21", "吾輩は猫である", "ワガハイ ワ ネコ デ アル", "夏目, 漱石", null, "978-4-10-101001-4", "2022", "jpn", "913.6");
        RestTemplate restTemplate = restTemplateAnswering(q -> {
            if (q.contains("query=title=") && q.contains("startRecord=41")) {
                assertTrue(q.contains("maximumRecords=20"), "remaining page size should be total - page size");
                return envelope(60, original);
            }
            if (q.contains("query=title=")) {
                return envelope(60, derivative);
            }
            if (q.contains("query=creator=")) {
                return NO_RECORDS;
            }
            throw new AssertionError("unexpected request: " + q);
        });

        List<BookSearchResult> results = provider(restTemplate).search("吾輩は猫である", new BookSearchContext(null, null));

        assertEquals("吾輩は猫である", results.get(0).title());
        assertEquals("贋作吾輩は猫である", results.get(1).title());
        verify(restTemplate, times(3)).getForObject(any(URI.class), eq(String.class));
    }

    @Test
    void doesNotHuntWhenTitleTotalExceedsLimit() {
        String derivative = record("R30", "宇宙の超難問三体問題", null, null, null, "978-4-00-000003-7", "2024", "jpn", "440");
        RestTemplate restTemplate = restTemplateAnswering(q -> {
            if (q.contains("query=title=")) {
                return envelope(1981, derivative);
            }
            if (q.contains("query=creator=")) {
                return NO_RECORDS;
            }
            throw new AssertionError("unexpected request: " + q);
        });

        List<BookSearchResult> results = provider(restTemplate).search("三体", new BookSearchContext(null, null));

        assertEquals(1, results.size());
        verify(restTemplate, times(2)).getForObject(any(URI.class), eq(String.class));
    }

    @Test
    void fallsBackToAnywhereWhenTitleAndCreatorAreEmpty() {
        String hit = record("R40", "投資初心者でもできる新NISA入門", null, null, null, "978-4-00-000004-4", "2026", "jpn", "338.15");
        RestTemplate restTemplate = restTemplateAnswering(q -> {
            if (q.contains("query=anywhere=")) {
                return envelope(1, hit);
            }
            return NO_RECORDS;
        });

        List<BookSearchResult> results = provider(restTemplate).search("投資 初心者", new BookSearchContext(null, null));

        assertEquals(1, results.size());
        assertEquals("Business & Economics", results.get(0).genre());
        verify(restTemplate, times(3)).getForObject(any(URI.class), eq(String.class));
    }

    @Test
    void nonJapaneseEditionIsRankedBelowJapaneseAndLanguageIsMapped() {
        String chinese = record("R50", "我是猫 = 吾輩は猫である", null, "夏目, 漱石", null, "978-7-00-000005-1", "2020", "chi", "913.6");
        String japanese = record("R51", "吾輩は猫である", null, "夏目, 漱石", null, "978-4-10-101001-4", "2003", "jpn", "913.6");
        RestTemplate restTemplate = restTemplateAnswering(q -> envelope(2, chinese, japanese));

        List<BookSearchResult> results = provider(restTemplate).search("吾輩は猫である", new BookSearchContext(null, null));

        assertEquals("吾輩は猫である", results.get(0).title());
        assertEquals("ja", results.get(0).language());
        assertEquals("zh", results.get(1).language());
    }

    @Test
    void dedupesSameIsbnAcrossTitleAndCreatorQueries() {
        String same = record("R60", "コミック東野圭吾ミステリー", null, "東野, 圭吾", null, "978-4-00-000006-8", "2019", "jpn", "726.1");
        RestTemplate restTemplate = restTemplateAnswering(q -> envelope(1, same));

        List<BookSearchResult> results = provider(restTemplate).search("東野圭吾", new BookSearchContext(null, null));

        assertEquals(1, results.size());
        verify(restTemplate, times(2)).getForObject(any(URI.class), eq(String.class));
    }

    @Test
    void limitsResultsToMaxRecords() {
        String[] many = new String[25];
        for (int i = 0; i < many.length; i++) {
            many[i] = record("R7" + i, "コンビニ人間 " + i, null, null, null, "978-4-00-00" + String.format("%04d", i) + "-0", "2016", "jpn", "913.6");
        }
        RestTemplate restTemplate = restTemplateAnswering(q -> envelope(25, many));

        assertEquals(20, provider(restTemplate).search("コンビニ人間", new BookSearchContext(null, null)).size());
    }

    @Test
    void amongPartialMatchesShorterMainTitleWinsOverNewerYear() {
        String canonical = record("R90", "完訳7つの習慣 : 人格主義の回復", null, "コヴィー, スティーブン・R.", null, "978-4-86394-024-7", "2013", "jpn", "159");
        String longer = record("R91", "奪われない!お金を守る7つの習慣 : 金融犯罪対策のプロが教える", null, null, null, "978-4-00-000009-9", "2024", "jpn", "338");
        String subtitleOnly = record("R92", "すごい幹細胞 : 「老けない人」の7つの習慣", null, null, null, "978-4-00-000010-5", "2025", "jpn", "491");
        RestTemplate restTemplate = restTemplateAnswering(q -> envelope(3, subtitleOnly, longer, canonical));

        List<BookSearchResult> results = provider(restTemplate).search("7つの習慣", new BookSearchContext(null, null));

        assertEquals("完訳7つの習慣 : 人格主義の回復", results.get(0).title());
        assertEquals("奪われない!お金を守る7つの習慣 : 金融犯罪対策のプロが教える", results.get(1).title());
        assertEquals("すごい幹細胞 : 「老けない人」の7つの習慣", results.get(2).title());
    }

    @Test
    void isbnAndGenreAreNullWhenAbsent() {
        String bare = record("R80", "リーダブルコード", null, null, null, null, "2012", "jpn", null);
        RestTemplate restTemplate = restTemplateAnswering(q -> envelope(1, bare));

        BookSearchResult result = provider(restTemplate).search("リーダブルコード", new BookSearchContext(null, null)).get(0);

        assertNull(result.isbn());
        assertNull(result.genre());
    }

    @Test
    void longQuerySkipsCreatorSearch() {
        String partial = record("R100", "働いていると本が読めなくなる理由を考える", null, null, null, "978-4-00-000011-2", "2024", "jpn", "019");
        RestTemplate restTemplate = restTemplateAnswering(q -> {
            if (q.contains("query=title=")) {
                return envelope(1, partial);
            }
            throw new AssertionError("creator/anywhere should not be queried for a long title query: " + q);
        });

        List<BookSearchResult> results = provider(restTemplate).search("なぜ働いていると本が読めなくなるのか", new BookSearchContext(null, null));

        assertEquals(1, results.size());
        verify(restTemplate, times(1)).getForObject(any(URI.class), eq(String.class));
    }

    @Test
    void primaryCallExceedingTimeBudgetFailsSoCallerCanFallBack() throws Exception {
        ExecutorService pool = Executors.newSingleThreadExecutor();
        try {
            RestTemplate restTemplate = restTemplateAnswering(q -> sleepThen(600, envelope(1, KIRAWARERU)));
            NdlSearchProvider provider = new NdlSearchProvider(restTemplate, pool, "https://ndlsearch.ndl.go.jp/api/sru", 20, 2, 100);

            assertThrows(ResourceAccessException.class,
                    () -> provider.search("嫌われる勇気", new BookSearchContext(null, null)));
        } finally {
            pool.shutdownNow();
        }
    }

    @Test
    void augmentCallExceedingTimeBudgetIsSkippedAndTitleResultsAreReturned() throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(2);
        try {
            String aboutAuthor = record("R110", "1冊でわかる村上春樹", null, "佐藤, 太郎", null, "978-4-00-000012-9", "2015", "jpn", "910.268");
            RestTemplate restTemplate = restTemplateAnswering(q -> {
                if (q.contains("query=title=")) {
                    return envelope(1, aboutAuthor);
                }
                return sleepThen(800, envelope(1, KIRAWARERU));
            });
            NdlSearchProvider provider = new NdlSearchProvider(restTemplate, pool, "https://ndlsearch.ndl.go.jp/api/sru", 20, 2, 300);

            List<BookSearchResult> results = provider.search("村上春樹", new BookSearchContext(null, null));

            assertEquals(1, results.size());
            assertEquals("1冊でわかる村上春樹", results.get(0).title());
        } finally {
            pool.shutdownNow();
        }
    }

    @Test
    void returnsEmptyListOnMalformedXmlOrBlankQuery() {
        RestTemplate malformed = restTemplateAnswering(q -> "<not-well-formed");

        assertTrue(provider(malformed).search("query", new BookSearchContext(null, null)).isEmpty());
        assertTrue(provider(malformed).search("", new BookSearchContext(null, null)).isEmpty());
        assertTrue(provider(malformed).search(null, new BookSearchContext(null, null)).isEmpty());
    }
}
