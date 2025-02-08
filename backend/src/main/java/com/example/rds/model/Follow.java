package com.example.rds.model;

import java.util.List;

import com.example.rds.context.FollowRepository;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Follow {
	/** フォローID（自動採番） */
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Id
	private Integer id;
	/** 対象ユーザ */
	private Integer userId;
	/** フォロワー */
	private Integer followerId;

	/** ユーザーをフォローします。 */
	public static Follow follow(FollowRepository rep, Integer userId, Integer followerId) {
		return rep.save(Follow.builder().userId(userId).followerId(followerId).build());
	}

	/** フォロワーを返します。 */
	public static List<Follow> getFollower(FollowRepository rep, Integer userId) {
		return rep.findByUserId(userId);
	}
}
