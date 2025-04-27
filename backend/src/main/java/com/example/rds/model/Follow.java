package com.example.rds.model;

import java.util.List;

import com.example.rds.context.AccountRepository;
import com.example.rds.context.FollowRepository;

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
public class Follow {
	/** フォローID（自動採番） */
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Id
	private Integer id;
	/** 対象ユーザ */
	@ManyToOne
    @JoinColumn(name = "user_id",referencedColumnName = "userId")
	private Account user;
	/** フォロワー */
	@ManyToOne
    @JoinColumn(name = "follower_id",referencedColumnName = "userId")
	private Account follower;

	/** ユーザーをフォローします。 */
	public static Follow follow(FollowRepository rep, AccountRepository aRep, Integer userId, Integer followerId) {
		//TODO:重複チェック
		var user = aRep.findByUserId(userId).get();
		var follower = aRep.findByUserId(followerId).get();
		return rep.save(Follow.builder().user(user).follower(follower).build());
	}

	/** フォローを解除します。 */
	public static void delete(FollowRepository rep,Integer id) {
		var follow = rep.findById(id).orElseThrow(() -> new EntityNotFoundException("Follow not found"));
		System.out.println(follow);
		rep.deleteById(follow.id);
	}

	/** フォロワーを返します。 */
	public static List<Follow> getFollower(FollowRepository rep, Integer userId) {
		return rep.findByUserId(userId);
	}

	/** フォローしている人を返します。 */
	public static List<Follow> getFollow(FollowRepository rep,Integer followerId){
		return rep.findByFollowerId(followerId);
	}
}
