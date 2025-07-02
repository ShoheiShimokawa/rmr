package com.rmr.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.GoodRepository;
import com.rmr.backend.context.PostRepository;
import com.rmr.backend.model.Good;
import com.rmr.backend.model.Post;
import com.rmr.backend.type.NotificationType;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GoodService {
    private final GoodRepository rep;
    private final PostRepository pRep;
    private final AccountRepository aRep;
    private final NotificationService notificationService;

    /** ポストにいいねします。 */
    public Good good(Integer postId, Integer userId) {
        Post post = pRep.findById(postId).get();
        boolean isNotifyTarget =rep.findByPostPostIdAndUserUserId(postId,userId).isEmpty() && !post.getUser().getUserId().equals(userId);
        Good good = Good.good(rep, pRep, aRep, postId, userId);
        if(isNotifyTarget){
        notificationService.register( post.getUser().getUserId(), userId, NotificationType.GOOD, postId);
       }
        return good;
    }

    /** いいねを取り消します */
    public void delete(Integer postId, Integer userId) {
        Good.delete(rep, postId, userId);
    }

    /** ポストにいいねした人を返します。 */
    public List<Good> getGooder(Integer postId) {
        return Good.getGooder(rep, postId);
    }

    /** 自分がいいねしたポストを返します。 */
    public List<Good> getGoodPostAll(Integer userId) {
        return Good.getGoodPostAll(rep, userId);
    }
}
