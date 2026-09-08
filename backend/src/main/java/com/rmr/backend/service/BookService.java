package com.rmr.backend.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.rmr.backend.context.BookRepository;
import com.rmr.backend.model.Book;
import com.rmr.backend.model.Book.RegisterBook;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookService {
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
}
