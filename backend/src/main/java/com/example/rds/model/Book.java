package com.example.rds.model;

import java.util.Optional;

import com.example.rds.context.BookRepository;
import com.example.rds.type.GenreType;
import com.example.rds.type.LargeGenreType;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "book")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Book {
	/** ブックID（独自自動採番）*/
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Id
	private Integer bookId;
	/** googleのId*/
	private String id;
	/** ISBNコード(13) */
	private String isbn;
	/** タイトル */
	private String title;
	/** 著者*/
	private String author;
	/** 大分類 */
	private LargeGenreType largeGenre;
	/** 中分類*/
	private GenreType genre;
	/** サムネイル */
	private String thumbnail;
	/** 備考*/
	private String description;
	/** 出版日*/
	private String publishedDate;
	
	/** ユーザに紐づく全ての本を返します。 */
//	public static List<Book> loadAllBook(BookRepository rep,String userId) {
//		return rep.findByUserId(userId);
//	}

	/** 本を一件返します。*/
	public static Optional<Book> get(BookRepository rep, Integer bookId) {
		return rep.findById(bookId);
	}

	/** 本を登録します。(手動登録)*/
	public static Book register(BookRepository rep, RegisterBook param) {
		return rep.save(RegisterBook.builder().id(param.id).isbn(param.isbn)
				.title(param.title).author(param.author).description(param.description)
				.genre(param.genre).thumbnail(param.thumbnail).build().create());
	}

	/** 登録パラメタ*/
	@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public static class RegisterBook {
	private String id;
	private String isbn;
	private String title;
	private String author;
	private GenreType genre;
	private String description;
	private String thumbnail;
	private String publishedDate;

	public Book create() {
		return Book.builder()
				.id(this.id)
				.isbn(this.isbn)
				.title(this.title)
				.author(this.author)
				.description(this.description)
				.genre(this.genre)
				.largeGenre(GenreType.classify(this.genre))
				.thumbnail(this.thumbnail)
				.publishedDate(this.publishedDate)
				.build();
	}
}

	/**　本を変更します。（手動用） */
	public Book update(BookRepository rep, RegisterBook param, Integer bookId) {
		Optional<Book> book = rep.findById(bookId);
		if (book.isPresent()) {
			book.get().setTitle(param.title);
			book.get().setAuthor(param.author);
			book.get().setDescription(param.description);
			book.get().setGenre(param.genre);
			book.get().setPublishedDate(param.publishedDate);
		}
		return rep.save(book.get());
	}

	/** 本を削除します。*/
	public void delete(BookRepository rep, Book book) {
		rep.deleteById(bookId);
	}
	
	
}
