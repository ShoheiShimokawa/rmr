package com.rmr.backend.context;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.rmr.backend.model.Book;

public interface BookRepository extends JpaRepository<Book,Integer>{
//	@Query("SELECT b FROM Book b WHERE b.userId = :userId")
//    List<Book> findByUserId(@Param("userId") String userId);

	@Query("SELECT b FROM Book b WHERE b.isbn = :isbn")
	Optional<Book> findByIsbn(@Param("isbn")String isbn);

	@Query("SELECT b FROM Book b WHERE b.id = :id")
	Optional<Book> findById(@Param("id")String id);

	/**
	 * タイトルに部分一致する本のタイトルを、前方一致を優先する順で返す(予測変換用)。
	 * 重複除去はしない(同じタイトルの本が複数登録されていることがあるため、呼び出し側でまとめる)。
	 */
	@Query("SELECT b.title FROM Book b "
			+ "WHERE b.title IS NOT NULL AND b.title <> '' "
			+ "AND LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) ESCAPE '\\' "
			+ "ORDER BY CASE WHEN LOWER(b.title) LIKE LOWER(CONCAT(:query, '%')) ESCAPE '\\' THEN 0 ELSE 1 END, b.title")
	List<String> findTitleSuggestions(@Param("query") String query, Pageable pageable);

	/**
	 * 著者名に部分一致する本の著者名を、前方一致を優先する順で返す(予測変換用)。
	 * 重複除去はしない(理由は{@link #findTitleSuggestions}と同じ)。
	 */
	@Query("SELECT b.author FROM Book b "
			+ "WHERE b.author IS NOT NULL AND b.author <> '' "
			+ "AND LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%')) ESCAPE '\\' "
			+ "ORDER BY CASE WHEN LOWER(b.author) LIKE LOWER(CONCAT(:query, '%')) ESCAPE '\\' THEN 0 ELSE 1 END, b.author")
	List<String> findAuthorSuggestions(@Param("query") String query, Pageable pageable);
}
