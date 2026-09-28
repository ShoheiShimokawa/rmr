package com.rmr.backend.context;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.rmr.backend.model.Memo;
import com.rmr.backend.type.HighlightVisibility;

public interface MemoRepository extends JpaRepository<Memo, Integer> {

    String VIEW = "SELECT m FROM Memo m "
            + "JOIN FETCH m.reading r JOIN FETCH r.book b JOIN FETCH m.user u LEFT JOIN FETCH m.label ";
    String NEWEST_FIRST = " ORDER BY m.registerDate DESC NULLS LAST, m.memoId DESC";

    /** ユーザに紐づく全てのハイライトを、新しい順に返します。(本人専用) */
    @Query(VIEW + "WHERE u.userId = :userId" + NEWEST_FIRST)
    List<Memo> findAllByUserIdNewestFirst(@Param("userId") Integer userId);

    /** ユーザに紐づく、指定した公開範囲のハイライトを新しい順に返します。 */
    @Query(VIEW + "WHERE u.userId = :userId AND m.visibility = :visibility" + NEWEST_FIRST)
    List<Memo> findByUserIdAndVisibilityNewestFirst(@Param("userId") Integer userId,
            @Param("visibility") HighlightVisibility visibility);
}
