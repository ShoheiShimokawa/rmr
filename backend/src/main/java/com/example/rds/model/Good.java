package com.example.rds.model;

import java.util.List;

import com.example.rds.context.GoodRepository;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
	private Integer postId;
	/** いいねしたユーザID */
	private Integer userId;

	/** ポストにいいねします。 */
	public static Good good(GoodRepository rep, Integer postId, Integer userId) {
		return rep.save(Good.builder().postId(postId).userId(userId).build());
	}

	/** ポストにいいねした人を返します。 */
	public static List<Good> getGooder(GoodRepository rep, Integer postId) {
		return rep.findByPostId(postId);
	}
}
