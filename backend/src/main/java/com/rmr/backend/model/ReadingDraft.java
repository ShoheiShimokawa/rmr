package com.rmr.backend.model;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.BookRepository;
import com.rmr.backend.context.ReadingDraftRepository;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 読書感想の下書き。ユーザと本の組み合わせごとに1件だけ持つ。 */
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "reading_draft", uniqueConstraints = {
		@UniqueConstraint(name = "reading_draft_user_book", columnNames = { "user_id", "book_id" }) })
public class ReadingDraft {
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Id
	private Integer draftId;
	/** ユーザID */
	@NotNull
	@ManyToOne
	@JoinColumn(name = "user_id", referencedColumnName = "userId")
	private Account user;
	/** 本ID */
	@NotNull
	@ManyToOne
	@JoinColumn(name = "book_id")
	private Book book;
	/** 評価 */
	private Integer rate;
	/** 感想 */
	@Column(columnDefinition = "text")
	private String thoughts;
	/** 推薦 */
	private boolean recommended;
	/** 登録日 */
	private Instant registerDate;
	/** 更新日 */
	private Instant updateDate;

	/** ユーザに紐づく下書きを更新日の新しい順に返します。 */
	public static List<ReadingDraft> findByUserId(ReadingDraftRepository rep, Integer userId) {
		return rep.findByUserUserIdOrderByUpdateDateDesc(userId);
	}

	/** 下書きを保存します。同じ本の下書きが既にあれば上書きします。 */
	@Transactional
	public static ReadingDraft save(ReadingDraftRepository rep, BookRepository bRep, AccountRepository aRep,
			Integer userId, SaveReadingDraft param) {
		Book book = Book.get(bRep, param.bookId()).orElseThrow(() -> new EntityNotFoundException("Book not found"));
		Account user = Account.get(aRep, userId).orElseThrow(() -> new EntityNotFoundException("User not found"));
		Instant now = Instant.now();

		ReadingDraft draft = rep.findByUserUserIdAndBookBookId(userId, book.getBookId())
				.orElseGet(() -> ReadingDraft.builder().user(user).book(book).registerDate(now).build());
		draft.setRate(param.rate());
		draft.setThoughts(param.thoughts());
		draft.setRecommended(param.recommended());
		draft.setUpdateDate(now);
		return rep.save(draft);
	}

	/** 下書きを削除します。存在しなければ何もしません。 */
	@Transactional
	public static void delete(ReadingDraftRepository rep, Integer userId, Integer bookId) {
		Optional<ReadingDraft> draft = rep.findByUserUserIdAndBookBookId(userId, bookId);
		draft.ifPresent(rep::delete);
	}

	/** 保存パラメタ(本人のIDは認証情報から解決するため持たない) */
	public record SaveReadingDraft(Integer bookId, Integer rate, String thoughts, boolean recommended) {
	}

	/** 削除パラメタ */
	public record SpecifyBookId(Integer bookId) {
	}
}
