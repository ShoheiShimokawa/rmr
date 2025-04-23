package com.example.rds.model;

import java.util.List;

import com.example.rds.context.GoodRepository;
import com.example.rds.context.PostRepository;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityNotFoundException;
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
	@ManyToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "post_id")
	private Post post;
	/** いいねしたユーザID */
	private Integer userId;

	/** ポストにいいねします。 */
	public static Good good(GoodRepository rep, PostRepository pRep,Integer postId, Integer userId) {
		var post = pRep.findById(postId).get();
		return rep.save(Good.builder().post(post).userId(userId).build());
	}

	/** いいねを取り消します。 */
	public static void delete(GoodRepository rep, Integer goodId) {
		Good good = rep.findById(goodId).orElseThrow(() -> new EntityNotFoundException("good not found"));
		rep.delete(good);
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
