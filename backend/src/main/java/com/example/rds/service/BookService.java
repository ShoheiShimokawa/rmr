package com.example.rds.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.rds.context.BookRepository;
import com.example.rds.model.Book;
import com.example.rds.model.Book.RegisterBook;

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

	/** 本を登録します。*/
	public Book register(RegisterBook param) {
		var book = rep.findById(param.getId());
			if(book.isEmpty()) {
				return Book.register(rep, param);
		} else {
			return book.get();
		}
	}
}
