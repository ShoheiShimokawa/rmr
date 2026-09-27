package com.rmr.backend.service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.rmr.backend.context.BookRepository;
import com.rmr.backend.model.Book;
import com.rmr.backend.model.Book.RegisterBook;
import com.rmr.backend.type.SuggestionType;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookService {
	private static final int MAX_SUGGEST_QUERY_LENGTH = 50;
	private static final int MAX_TITLE_SUGGESTIONS = 6;
	private static final int MAX_AUTHOR_SUGGESTIONS = 3;
	// 重複除去で減る分の余裕を持たせて多めに取得する
	private static final int TITLE_FETCH_LIMIT = 20;
	private static final int AUTHOR_FETCH_LIMIT = 10;
	private static final Pattern LIKE_WILDCARDS = Pattern.compile("[\\\\%_]");

	private final BookRepository rep;

	/** 全ての本を返します。*/
	//	public List<Book>loadAllBook(String userId){
	//		return Book.loadAllBook(rep,userId);
	//	}

	/** 本を一件返します。*/
	public Optional<Book> get(Integer bookId) {
		return Book.get(rep, bookId);
	}

	/** 本を登録します。ISBNがあればISBNで、無ければidで重複チェックします。*/
	public Book register(RegisterBook param) {
		if (StringUtils.hasText(param.getIsbn())) {
			Optional<Book> byIsbn = rep.findByIsbn(param.getIsbn());
			if (byIsbn.isPresent()) {
				return byIsbn.get();
			}
		}
		var book = rep.findById(param.getId());
			if(book.isEmpty()) {
				return Book.register(rep, param);
		} else {
			return book.get();
		}
	}

	/**
	 * 予測変換候補を返します。登録済みの本のタイトル・著者から部分一致するものを、前方一致優先で
	 * タイトル最大{@value #MAX_TITLE_SUGGESTIONS}件・著者最大{@value #MAX_AUTHOR_SUGGESTIONS}件返す。
	 * クエリが空、または長すぎる場合は空を返す。
	 */
	public List<Book.Suggestion> suggest(String rawQuery) {
		String query = normalize(rawQuery);
		if (!StringUtils.hasText(query) || query.length() > MAX_SUGGEST_QUERY_LENGTH) {
			return List.of();
		}

		String escapedQuery = escapeLikeWildcards(query);
		List<Book.Suggestion> suggestions = new ArrayList<>();
		List<String> titles = rep.findTitleSuggestions(escapedQuery, PageRequest.of(0, TITLE_FETCH_LIMIT));
		for (String title : dedupeIgnoreCase(titles).stream().limit(MAX_TITLE_SUGGESTIONS).toList()) {
			suggestions.add(new Book.Suggestion(SuggestionType.TITLE, title));
		}
		List<String> authors = rep.findAuthorSuggestions(escapedQuery, PageRequest.of(0, AUTHOR_FETCH_LIMIT));
		for (String author : dedupeIgnoreCase(authors).stream().limit(MAX_AUTHOR_SUGGESTIONS).toList()) {
			suggestions.add(new Book.Suggestion(SuggestionType.AUTHOR, author));
		}
		return suggestions;
	}

	/** 全角/半角の表記ゆれを吸収し、前後の空白を除く。 */
	private String normalize(String query) {
		if (!StringUtils.hasText(query)) {
			return "";
		}
		return Normalizer.normalize(query, Normalizer.Form.NFKC).trim();
	}

	/** LIKE検索のワイルドカード(\, %, _)をエスケープする。 */
	private String escapeLikeWildcards(String value) {
		return LIKE_WILDCARDS.matcher(value).replaceAll("\\\\$0");
	}

	/** 大文字小文字の違いだけの表記ゆれを、先に見つかったものを残してまとめる。 */
	private List<String> dedupeIgnoreCase(List<String> values) {
		Map<String, String> byLowerCase = new LinkedHashMap<>();
		for (String value : values) {
			byLowerCase.putIfAbsent(value.toLowerCase(), value);
		}
		return new ArrayList<>(byLowerCase.values());
	}
}
