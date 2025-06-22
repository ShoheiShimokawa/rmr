package com.rmr.backend.controller;

import java.util.Optional;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rmr.backend.model.Book;
import com.rmr.backend.model.Book.RegisterBook;
import com.rmr.backend.service.BookService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api")
public class BookController {
	private final BookService service;

//    @GetMapping("/book")
//    public List<Book> findBook(@RequestParam String userId) {
//        List<Book> list = service.loadAllBook(userId);
//        return list;
//    }
    
    @GetMapping("/book/id")
    public Book get(Integer bookId) {
    	Optional<Book> book=service.get(bookId);
    	return book.get();
    }
    
    @PostMapping("/book")
    public Book register(@RequestBody RegisterBook params) {
    	return this.service.register(params);
    }
}
