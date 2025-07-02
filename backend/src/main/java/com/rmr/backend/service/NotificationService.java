package com.rmr.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.NotificationRepository;
import com.rmr.backend.context.PostRepository;
import com.rmr.backend.model.Notification;
import com.rmr.backend.type.NotificationType;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository rep;
      private final AccountRepository aRep;
    private final PostRepository pRep;

    /** ユーザに紐づく通知を全て返します。 */
    public List<Notification> getAll(Integer userId) {
        return Notification.getAll(rep, userId);
    }
    
    /** 通知を登録します。 */
    public Notification register(Integer userId, Integer notifierId, NotificationType notificationType,
            Integer postId) {
        return Notification.register(rep, aRep, pRep, userId, notifierId, notificationType, postId);
    }
    
    /** 通知を既読にします。 */
    @Transactional
    public void markAllAsDone(Integer userId) {
        Notification.markAllAsDone(rep, userId);
    }
}
