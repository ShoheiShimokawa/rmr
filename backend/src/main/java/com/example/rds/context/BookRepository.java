package com.example.rds.context;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.rds.model.Book;

public interface BookRepository extends JpaRepository<Book,Integer>{
//	@Query("SELECT b FROM Book b WHERE b.userId = :userId")
//    List<Book> findByUserId(@Param("userId") String userId);

	@Query("SELECT b FROM Book b WHERE b.isbn = :isbn")
	Optional<Book> findByIsbn(@Param("isbn")String isbn);
	
	@Query("SELECT b FROM Book b WHERE b.id = :id")
	Optional<Book> findById(@Param("id")String id);
}
