package com.example.rds.context;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.rds.model.Label;

public interface LabelRepository extends JpaRepository<Label, Integer> {
   @Query("SELECT l FROM Label l WHERE l.labelId = :labelId")
    List<Label> findByLabelId(@Param("labelId") Integer labelId);
     @Query("SELECT l FROM Label l WHERE l.user.userId = :userId")
     List<Label> findByUserId(@Param("userId") Integer userId);
   Optional<Label> findByUserUserIdAndLabel(Integer userId, String label);




}
