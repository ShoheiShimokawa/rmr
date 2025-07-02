package com.rmr.backend.context;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.rmr.backend.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification,Integer>{
    
    @Query("SELECT n FROM Notification n WHERE n.user.userId = :userId")
    List<Notification> findByUserId(@Param("userId") Integer userId);

    @Modifying
    @Query("UPDATE Notification n SET n.statusType = DONE WHERE n.user.userId = :userId AND n.statusType = NONE")
    void markAllAsDone(@Param("userId") Integer userId);

}
