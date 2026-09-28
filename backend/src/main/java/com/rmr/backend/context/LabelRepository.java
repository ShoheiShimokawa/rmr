package com.rmr.backend.context;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rmr.backend.model.Label;

public interface LabelRepository extends JpaRepository<Label, Integer> {
    Optional<Label> findFirstByUserUserIdAndLabelOrderByLabelIdAsc(Integer userId, String label);
}
