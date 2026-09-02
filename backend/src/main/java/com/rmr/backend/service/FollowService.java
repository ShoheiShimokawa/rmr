package com.rmr.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.FollowRepository;
import com.rmr.backend.model.Follow;
import com.rmr.backend.type.NotificationType;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FollowService {
    private final FollowRepository rep;
    private final AccountRepository aRep;
    private final NotificationService notificationService;

    /** ユーザをフォローします。 */
    public Follow follow(Integer userId, Integer followerId) {
        boolean isNotifyTarget =rep.findByUserUserIdAndFollowerUserId(userId,followerId).isEmpty();
        Follow follow = Follow.follow(rep, aRep, userId, followerId);
        if(isNotifyTarget){
            notificationService.register(userId, followerId, NotificationType.FOLLOW, null);
        }
        return follow;
    }

    /** フォロワーを返します。 */
    public List<Follow> getFollower(Integer userId) {
        return Follow.getFollower(rep, userId);
    }

    /** フォローしている人を返します。 */
    public List<Follow> getFollow(Integer followerId) {
        return Follow.getFollow(rep, followerId);
    }
    
    /** フォローを解除します。(フォローした本人のみ解除できる) */
    public void delete(Integer id, Integer currentUserId) {
        Follow follow = rep.findById(id).orElseThrow(() -> new EntityNotFoundException("Follow not found"));
        if (!follow.getFollower().getUserId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only unfollow on your own behalf.");
        }
        Follow.delete(rep, id);
    }
}
