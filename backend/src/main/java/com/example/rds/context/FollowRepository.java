package com.example.rds.context;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.rds.model.Follow;

public interface FollowRepository extends JpaRepository<Follow, Integer> {

    @Query("SELECT f FROM Follow f WHERE f.user.userId = :userId")
    List<Follow> findByUserId(@Param("userId") Integer userId);

    @Query("SELECT f FROM Follow f WHERE f.follower.userId = :followerId")
    List<Follow> findByFollowerId(@Param("followerId") Integer followerId);
    
    Optional<Follow> findByUserUserIdAndFollowerUserId(Integer userId, Integer followerId);
}
