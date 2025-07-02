package com.rmr.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.FollowRepository;
import com.rmr.backend.model.Follow;
import com.rmr.backend.type.NotificationType;

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
    
    /** フォローを解除します。 */
    public void delete(Integer id) {
        Follow.delete(rep,id);
    }
}
