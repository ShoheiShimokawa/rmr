package com.example.rds.model;

import java.time.LocalDate;
import java.util.List;

import com.example.rds.context.PostRepository;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Post {
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Id
	private Integer postId;
	/** ユーザID */
	private Integer userId;
	/** 読書ID */
	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "reading_id")
	private Reading reading;
	/** いいね数 */
	private Integer goodCount;
	/** ポスト日 */
	private LocalDate registerDate;
	/** 更新日 */
	private LocalDate updateDate;

	/** 感想をポストします。 */
	// public static Post registerPost(PostRepository rep,Integer readingId) {
	// return rep.save(readingId);
	// }
	/** 登録パラメタ */

	/** ユーザに紐づくポストを全て返します。 */
	public static List<Post> getPostAllByUser(PostRepository rep, Integer userId) {
		return rep.findByUserId(userId);
	}

	/** ポストを返却します。（タイムライン用） */
	public static List<Post> getPostAll(PostRepository rep, Integer userId) {
		return rep.findAll();
	}

}
