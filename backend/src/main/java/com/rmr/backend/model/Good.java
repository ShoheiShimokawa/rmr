package com.rmr.backend.model;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.rmr.backend.context.GoodRepository;
import com.rmr.backend.context.PostRepository;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Good {
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Id
	/** いいねID */
	private Integer goodId;
	/** 対象のポストID */
	@NotNull
	@ManyToOne
	@JoinColumn(name = "post_id")
	private Post post;
	/** いいねしたユーザID */
	private Integer userId;

	/** ポストにいいねします。 */
	public static Good good(GoodRepository rep, PostRepository pRep,Integer postId, Integer userId) {
		var post = pRep.findById(postId).get();
		Optional<Good> good = rep.findByPostPostIdAndUserId(postId, userId);
		if(good.isPresent()){
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Good already exists.");
		}
		return rep.save(Good.builder().post(post).userId(userId).build());
	}

	/** いいねを取り消します。 */
	public static void delete(GoodRepository rep, Integer postId,Integer userId) {
		Optional<Good> good = rep.findByPostPostIdAndUserId(postId, userId);
		if(good.isPresent()){
		rep.delete(good.get());
		}
	}
	
	/** ポストにいいねした人を返します。 */
	public static List<Good> getGooder(GoodRepository rep, Integer postId) {
		return rep.findByPostId(postId);
	}

	/** 自分がいいねしたポストを返します。 */
	public static List<Good> getGoodPostAll(GoodRepository rep, Integer userId) {
		return rep.findByUserId(userId);
	}
	


}
