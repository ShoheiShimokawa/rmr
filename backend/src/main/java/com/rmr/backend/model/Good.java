package com.rmr.backend.model;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.GoodRepository;
import com.rmr.backend.context.PostRepository;
import com.rmr.backend.type.GoodStatusType;

import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
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
	@ManyToOne
    @JoinColumn(name = "user_id")
	private Account user;
	/** 状態 */
	@Enumerated
	@NotNull
	private GoodStatusType statusType;

	/** ポストにいいねします。 */
	public static Good good(GoodRepository rep, PostRepository pRep,AccountRepository aRep,Integer postId, Integer userId) {
		var post = pRep.findById(postId).get();
		var account = aRep.findByUserId(userId).get();
		Optional<Good> good = rep.findByPostPostIdAndUserUserId(postId, userId);
		if(good.isPresent() && good.get().statusType.equals(GoodStatusType.VALID)){
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Good already exists.");
		}
		return rep.save(Good.builder().post(post).user(account).statusType(GoodStatusType.VALID).build());
	}

	/** いいねを取り消します。 */
	public static void delete(GoodRepository rep, Integer postId,Integer userId) {
		Optional<Good> good = rep.findByPostPostIdAndUserUserId(postId, userId);
		if (good.isPresent() && good.get().statusType.equals(GoodStatusType.VALID)) {
			good.get().setStatusType(GoodStatusType.INVALID);
			rep.save(good.get());
		}
	}
	
	/** ポストにいいねした人を返します。 */
	public static List<Good> getGooder(GoodRepository rep, Integer postId) {
		List<Good> allData = rep.findByPostId(postId);
		return allData.stream().filter((v)->v.getStatusType().equals(GoodStatusType.VALID)).toList();
	}

	/** 自分がいいねしたポストを返します。 */
	public static List<Good> getGoodPostAll(GoodRepository rep, Integer userId) {
		List<Good> allData = rep.findByUserId(userId);
		return allData.stream().filter((v)->v.getStatusType().equals(GoodStatusType.VALID)).toList();
	}
}
