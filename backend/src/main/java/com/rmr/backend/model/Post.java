package com.rmr.backend.model;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import com.rmr.backend.context.GoodRepository;
import com.rmr.backend.context.PostRepository;
import com.rmr.backend.context.ReadingRepository;
import com.rmr.backend.type.BookStatusType;
import com.rmr.backend.type.PostType;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
	/** ポストID */
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Id
	private Integer postId;
	/** ユーザID */
	@ManyToOne
    @JoinColumn(name = "user_id",referencedColumnName = "userId")
	private Account user;
	/** 読書ID */
	@ManyToOne
	@JoinColumn(name = "reading_id")
	private Reading reading;
	/** 推薦 */
	private PostType postType;
	/** ポスト日 */
	private Instant registerDate;
	/** 更新日 */
	private Instant updateDate;

	/** ID(google)に紐付く投稿を全て返します。 */
	public static List<Post> findById(PostRepository rep,String id) {
		return rep.findById(id);
	}

	/** 感想をポストします。すでに同じ状態のreadingに紐づくポストが存在していたら更新します。 */
	public static Post registerPost(PostRepository rep, ReadingRepository rRep, Integer readingId,boolean recommended) {
		
		var reading = rRep.findById(readingId).orElseThrow(() -> new EntityNotFoundException("Reading not found"));
		
		Optional<Post> existPost=rep.findByReadingId(readingId).stream()
				.findFirst();
		if (existPost.isPresent() && existPost.get().getReading().getStatusType().equals(BookStatusType.DONE)) {
			var updatedPost = existPost.get();
			if (recommended) {
				updatedPost.setPostType(PostType.RECOMMENDED);
			}else if(recommended==false && reading.getThoughts().equals("") && reading.getRate()==0){
				updatedPost.setPostType(PostType.ONLY_STAR);
			} else {
				updatedPost.setPostType(PostType.WITH_THOUGHTS);
			}
			updatedPost.setReading(reading);
			updatedPost.setUpdateDate(Instant.now());
			return rep.save(updatedPost);
		} else {
			PostType postType;
			if (recommended) {
				postType=PostType.RECOMMENDED;
			}else if(recommended==false && reading.getThoughts().equals("") && reading.getRate()!=0){
				postType=PostType.ONLY_STAR;
			} else {
				postType=PostType.WITH_THOUGHTS;
			}
		var post = Post.builder().reading(reading).user(reading.getUser()).postType(postType).registerDate(Instant.now()).build();
		return rep.save(post);
		}
	}
	
	/** ユーザに紐づくポストを全て返します。 */
	public static List<Post> getPostAllByUser(PostRepository rep, Integer userId) {
		return rep.findByUserId(userId);
	}

	/** ポストを変更します。 */
	// public static Post update(PostRepository rep,ReadingRepository rRep,Integer readingId) {
	// 	Reading reading = rRep.findById(readingId).orElseThrow(() -> new EntityNotFoundException("Reading not found"));
		
	// }
	
	/** いいね数を含めたユーザに紐づくポストを全て返します。 */
	public static List<PostWithGoodCount> getPostWithGoodCount(PostRepository rep, GoodRepository gRep, Integer userId) {
	List<Post> posts = Post.getPostAllByUser(rep, userId);
	Map<Integer, Long> goodCounts = gRep.countGroupByPostId(); 

	return posts.stream().map(post -> {
		long goodCount = goodCounts.getOrDefault(post.getPostId(), 0L);
		return PostWithGoodCount.builder()
			.postId(post.getPostId())
			.user(post.getUser())
				.reading(post.getReading())
			.postType(post.getPostType())
			.registerDate(post.getRegisterDate())
			.updateDate(post.getUpdateDate())
			.goodCount(goodCount)
			.build();
	}).toList();
}

	/** ポストを返却します。（タイムライン用） */
	public static List<PostWithGoodCount> getPostAll(PostRepository rep, GoodRepository gRep) {
	List<Post> posts = rep.findAll();
	Map<Integer, Long> goodCounts = gRep.countGroupByPostId();

	return posts.stream().map(post -> {
		long goodCount = goodCounts.getOrDefault(post.getPostId(), 0L);
		return PostWithGoodCount.builder()
			.postId(post.getPostId())
			.user(post.getUser())
			.reading(post.getReading())
			.postType(post.getPostType())
			.registerDate(post.getRegisterDate())
			.updateDate(post.getUpdateDate())
			.goodCount(goodCount)
			.build();
	}).toList();
}

	
	/** 年間ポスト数を返します。 */
	public static List<YearlyPostRecord> getPostRecord(PostRepository rep, Integer userId) {
		List<Post> posts = rep.findByUserId(userId);
		var a = posts.stream()
    .collect(Collectors.groupingBy((Post post) ->
        post.getRegisterDate()
             .atZone(ZoneOffset.UTC)
            .toLocalDate()
    ));
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
	@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public static class YearlyPostRecord {
	private LocalDate date;
	private Integer posts;
}
	@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public static class PostWithGoodCount {
	private Integer postId;
	private Account user;
	private Reading reading;
	private PostType postType;
	private Instant registerDate;
	private Instant updateDate;
	private long goodCount;
}
}
