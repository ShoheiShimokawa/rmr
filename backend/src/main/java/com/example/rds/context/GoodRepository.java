package com.example.rds.context;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.rds.model.Good;

public interface GoodRepository extends JpaRepository<Good, Integer> {
    @Query("SELECT g FROM Good g WHERE g.post.postId = :postId")
    List<Good> findByPostId(@Param("postId") Integer postId);

     @Query("SELECT g FROM Good g WHERE g.userId = :userId")
    List<Good> findByUserId(@Param("userId") Integer userId);

}
