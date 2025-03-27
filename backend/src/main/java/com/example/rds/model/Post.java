package com.example.rds.model;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.example.rds.context.AccountRepository;
import com.example.rds.context.PostRepository;
import com.example.rds.context.ReadingRepository;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
	@ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id",referencedColumnName = "userId")
	private Account user;
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
	public static Post registerPost(PostRepository rep,ReadingRepository rRep,Integer readingId) {
		var reading = rRep.findById(readingId).orElseThrow(() -> new RuntimeException("Reading not found"));
		var post =Post.builder().reading(reading).user(reading.getUser()).registerDate(LocalDate.now()).build();
		return rep.save(post);
	}

	/** ユーザに紐づくポストを全て返します。 */
	public static List<PostWithUser> getPostAllByUser(PostRepository rep,AccountRepository aRep, Integer userId) {
		Optional<Account> opUser = aRep.findByUserId(userId);
		if (opUser.isEmpty()) {
        return Collections.emptyList(); // Accountが見つからない場合は空リストを返す
    }	
		Account user = opUser.get();
		return rep.findByUserId(userId).stream()
				.map(post -> PostWithUser.from(post, user))
				.collect(Collectors.toList());// Optional の処理をシンプルに	}
	}

	/** ポストを返却します。（タイムライン用） */
	public static List<Post> getPostAll(PostRepository rep, Integer userId) {
		return rep.findAll();
	}
	@Builder
	public record PostWithUser(
		Integer postId,
		Integer userId,
		Reading reading,
		LocalDate registerDate,
		LocalDate updateDate,
		String name,
		String handle){
		public static PostWithUser from(Post post,Account account){
			return PostWithUser.builder()
                .postId(post.getPostId())
				.userId(post.user.getUserId())
				.reading(post.reading)
				.registerDate(post.registerDate)
				.updateDate(post.updateDate)
                .name(account.getName())
                .handle(account.getHandle())
                .build();
		}
	}
}
