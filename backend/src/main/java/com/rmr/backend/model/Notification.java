package com.rmr.backend.model;

import java.time.Instant;
import java.util.List;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.NotificationRepository;
import com.rmr.backend.context.PostRepository;
import com.rmr.backend.type.NotificationStatusType;
import com.rmr.backend.type.NotificationType;

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
public class Notification {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	@Id
	/** 通知ID */
    private Integer notificationId;
    /** ユーザID(被通知者) */
    @ManyToOne
    @JoinColumn(name = "user_id",referencedColumnName = "userId")
    private Account user;
    /** 通知者 */
    @ManyToOne
    @JoinColumn(name = "notifier_id",referencedColumnName = "userId")
    private Account notifier;
    /** 通知種別 */
    private NotificationType notificationType;
    /** ポストID */
    @ManyToOne
	@JoinColumn(name = "post_id")
    private Post post;
    /** 既読状態 */
    private NotificationStatusType statusType;
    /** 登録日時 */
    private Instant registerDate;

    /** ユーザに紐づく通知を返します。 */
    public static List<Notification> getAll(NotificationRepository rep, Integer userId) {
        return rep.findByUserId(userId);
    }

    /** 通知を登録します。 */
    public static Notification register(
            NotificationRepository rep,
            AccountRepository aRep,
            PostRepository pRep,
            Integer userId,
            Integer notifierId,                 
            NotificationType notificationType,
            Integer postId
        ) {        
        Account user = aRep.findByUserId(userId).orElseThrow(() -> new EntityNotFoundException("user not found"));
        Account notifier = aRep.findByUserId(notifierId).orElseThrow(() -> new EntityNotFoundException("user not found"));
         Post post = null;
        if (postId != null) {
        post = pRep.findById(postId)
            .orElseThrow(() -> new EntityNotFoundException("post not found"));
        }
        Notification notification = Notification.builder().user(user).notifier(notifier)
                .notificationType(notificationType).post(post).statusType(NotificationStatusType.NONE).registerDate(Instant.now()).build();
        return rep.save(notification);
    }

    /** 登録パラメタ(未使用) */
    @Data
	@Builder
	@AllArgsConstructor
	@NoArgsConstructor
    public static class RegisterNotification {
        private Integer userId;
        private NotificationType notificationType;
        private Integer notifierId;
        private Integer postId;
    }

    /** 通知を既読にします。 */
    public static void markAllAsDone(NotificationRepository rep, Integer userId) {
        rep.markAllAsDone(userId);
    }
}
