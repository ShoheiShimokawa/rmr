package com.example.rds.model;

import java.util.List;

import com.example.rds.context.FollowRepository;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
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
public class Follow {
	/** フォローID（自動採番） */
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Id
	private Integer id;
	/** 対象ユーザ */
	@ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id",referencedColumnName = "userId")
	private Account user;
	/** フォロワー */
	@ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "follower_id",referencedColumnName = "userId")
	private Account follower;

	/** ユーザーをフォローします。 */
	// public static Follow follow(FollowRepository rep, Integer userId, Integer followerId) {
	// 	return rep.save(Follow.builder().userId(userId).followerId(followerId).build());
	// }

	/** フォロワーを返します。 */
	public static List<Follow> getFollower(FollowRepository rep, Integer userId) {
		return rep.findByUserId(userId);
	}

	/** フォローしている人を返します。 */
	public static List<Follow> getFollow(FollowRepository rep,Integer followerId){
		return rep.findByFollowerId(followerId);
	}
}
