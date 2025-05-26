package com.example.rds.context;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.rds.model.Label;
import com.example.rds.model.Reading;

public interface ReadingRepository extends JpaRepository<Reading, Integer> {
    @Query("SELECT r FROM Reading r WHERE r.book.bookId = :bookId")
    List<Reading> findByBookId(@Param("bookId") Integer bookId);

    @Query("SELECT r FROM Reading r WHERE r.book.id = :id")
    List<Reading> findById(@Param("id") String id);
   
    @Query("SELECT r FROM Reading r WHERE r.user.userId = :userId")
    List<Reading> findReadingsByUserId(@Param("userId") Integer userId);

    @Query("""
                SELECT TO_CHAR(DATE_TRUNC('month', r.readDate), 'YYYY-MM') AS month,
                       r.book.genre AS genre,
                       COUNT(r.book.genre) AS genre_count
                FROM Reading r
                JOIN r.book b
                WHERE r.user.userId = :userId AND r.statusType = BookStatusType.DONE
                GROUP BY TO_CHAR(DATE_TRUNC('month', r.readDate), 'YYYY-MM'), r.book.genre
                ORDER BY TO_CHAR(DATE_TRUNC('month', r.readDate), 'YYYY-MM')
            """)
    List<Object[]> findMonthlyReadingDataByUser(@Param("userId") Integer userId);

    Optional<Reading> findByUserUserIdAndBookBookId(Integer userId, Integer bookId);

}
