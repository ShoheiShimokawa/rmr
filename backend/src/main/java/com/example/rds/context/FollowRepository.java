package com.example.rds.context;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.rds.model.Follow;

public interface FollowRepository extends JpaRepository<Follow, Integer> {

    @Query("SELECT f FROM Follow f WHERE f.userId = :userId")
    List<Follow> findByUserId(@Param("userId") Integer userId);
}
