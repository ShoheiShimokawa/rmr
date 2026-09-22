package com.rmr.backend.context;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rmr.backend.model.ReadingDraft;

public interface ReadingDraftRepository extends JpaRepository<ReadingDraft, Integer> {

    List<ReadingDraft> findByUserUserIdOrderByUpdateDateDesc(Integer userId);

    Optional<ReadingDraft> findByUserUserIdAndBookBookId(Integer userId, Integer bookId);

}
