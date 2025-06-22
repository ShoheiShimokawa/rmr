package com.rmr.backend.context;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.rmr.backend.model.Post;

public interface PostRepository extends JpaRepository<Post,Integer>{
	@Query("SELECT p FROM Post p WHERE p.user.userId = :userId")
	List<Post> findByUserId(@Param("userId") Integer userId);
	
	@Query("SELECT p FROM Post p WHERE p.reading.book.id = :id")
	List<Post> findById(@Param("id") String id);
	
	@Query("SELECT p FROM Post p WHERE p.reading.readingId = :readingId")
	List<Post> findByReadingId(@Param("readingId") Integer readingId);

	
}
