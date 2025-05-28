package com.example.rds.model;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.example.rds.context.PostRepository;
import com.example.rds.context.ReadingRepository;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityNotFoundException;
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
	@ManyToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "reading_id")
	private Reading reading;
	/** いいね数 */
	private Integer goodCount;
	/** ポスト日 */
	private LocalDate registerDate;
	/** 更新日 */
	private LocalDate updateDate;

	/** ID(google)に紐付く投稿を全て返します。 */
	public static List<Post> findById(PostRepository rep,String id) {
		return rep.findById(id);
	}

	/** 感想をポストします。 */
	public static Post registerPost(PostRepository rep, ReadingRepository rRep, Integer readingId) {
		var reading = rRep.findById(readingId).orElseThrow(() -> new EntityNotFoundException("Post not found"));
		var post = Post.builder().reading(reading).user(reading.getUser()).registerDate(LocalDate.now()).build();
		return rep.save(post);
	}
	
	/** ユーザに紐づくポストを全て返します。 */
	public static List<Post> getPostAllByUser(PostRepository rep,Integer userId) {
		return rep.findByUserId(userId);
	}

	/** ポストを返却します。（タイムライン用） */
	public static List<Post> getPostAll(PostRepository rep, Integer userId) {
		return rep.findAll();
	}

	
	/** 年間ポスト数を返します。 */
	public static List<YearlyPostRecord> getPostRecord(PostRepository rep, Integer userId) {
		List<Post> posts = rep.findByUserId(userId);
		var a = posts.stream().collect(Collectors.groupingBy((Post post) -> post.getRegisterDate()));
		Map<LocalDate, Integer> map = new HashMap<>();
		for (var b : a.entrySet()) {
			map.putIfAbsent(b.getKey(), b.getValue().toArray().length);
		}
		
		return map.entrySet().stream().map(v->{
			LocalDate yearMonth=v.getKey();
			Integer postCount = v.getValue();

			return YearlyPostRecord.builder().date(yearMonth).posts(postCount).build();
		}).toList();
	}

	/** 年間ポスト数 */
	@Builder
	public record YearlyPostRecord(LocalDate date,Integer posts){}
}
