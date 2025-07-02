package com.rmr.backend.model;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.FollowRepository;
import com.rmr.backend.type.FollowStatusType;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityNotFoundException;
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
	/** 状態 */
	@Enumerated
	@NotNull
	private FollowStatusType statusType;

	/** ユーザーをフォローします。 */
	public static Follow follow(FollowRepository rep, AccountRepository aRep, Integer userId, Integer followerId) {
		Optional<Follow> follow = rep.findByUserUserIdAndFollowerUserId(userId, followerId);
		if (follow.isPresent() && follow.get().statusType.equals(FollowStatusType.VALID)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Follow already exists.");
		}
		var user = aRep.findByUserId(userId).get();
		var follower = aRep.findByUserId(followerId).get();
		return rep.save(Follow.builder().user(user).follower(follower).statusType(FollowStatusType.VALID).build());
	}

	/** フォローを解除します。 */
	public static void delete(FollowRepository rep,Integer id) {
		var follow = rep.findById(id).orElseThrow(() -> new EntityNotFoundException("Follow not found"));
		follow.setStatusType(FollowStatusType.INVALID);
		rep.save(follow);
	}

	/** フォロワーを返します。 */
	public static List<Follow> getFollower(FollowRepository rep, Integer userId) {
		List<Follow> raw = rep.findByUserId(userId);
		return raw.stream().filter((r)->r.statusType.equals(FollowStatusType.VALID)).toList();
	}

	/** フォローしている人を返します。 */
	public static List<Follow> getFollow(FollowRepository rep, Integer followerId) {
		List<Follow> raw =rep.findByFollowerId(followerId);
		return raw.stream().filter((r)->r.statusType.equals(FollowStatusType.VALID)).toList();
	}
}
