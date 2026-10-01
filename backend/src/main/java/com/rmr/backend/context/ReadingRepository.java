package com.rmr.backend.context;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.rmr.backend.model.Reading;
import com.rmr.backend.type.BookStatusType;
import com.rmr.backend.type.FollowStatusType;

public interface ReadingRepository extends JpaRepository<Reading, Integer> {
    @Query("SELECT r FROM Reading r WHERE r.book.bookId = :bookId")
    List<Reading> findByBookId(@Param("bookId") Integer bookId);

    @Query("SELECT r FROM Reading r WHERE r.book.id = :id OR (:isbn IS NOT NULL AND r.book.isbn = :isbn)")
    List<Reading> findByBookIdOrIsbn(@Param("id") String id, @Param("isbn") String isbn);

    @Query("SELECT r FROM Reading r WHERE r.user.userId = :userId")
    List<Reading> findReadingsByUserId(@Param("userId") Integer userId);

    Optional<Reading> findByUserUserIdAndBookBookId(Integer userId, Integer bookId);

    /** ランキング計算用の列だけを取得する(統計目的でエンティティをロードしない)。INVALIDは除く。 */
    @Query("SELECT b.bookId, b.isbn, b.title, b.author, b.thumbnail, r.readingId, r.user.userId, r.statusType, r.rate, "
            + "r.registerDate, r.updateDate, r.toReadDate, r.readingDate, r.readDate "
            + "FROM Reading r JOIN r.book b WHERE r.statusType <> :invalid")
    List<Object[]> findActivityRowsRaw(@Param("invalid") BookStatusType invalid);

    /** ランキング計算用の読書行を全件返します(INVALIDを除く)。 */
    default List<Reading.ActivityRow> findActivityRows() {
        return findActivityRowsRaw(BookStatusType.INVALID).stream().map(Reading.ActivityRow::fromRow).toList();
    }

    /** フォロー中のユーザーの、最近の有効な読書を新しい順に返します(自分自身は除く)。 */
    @Query("SELECT r FROM Reading r JOIN FETCH r.book JOIN FETCH r.user u "
            + "WHERE r.statusType <> :invalid AND u.userId <> :viewerId "
            + "AND u.userId IN (SELECT f.user.userId FROM Follow f WHERE f.follower.userId = :viewerId AND f.statusType = :valid) "
            + "ORDER BY COALESCE(r.updateDate, r.readDate, r.readingDate, r.toReadDate, r.registerDate) DESC")
    List<Reading> findRecentByFollowedUsers(@Param("viewerId") Integer viewerId,
            @Param("valid") FollowStatusType valid, @Param("invalid") BookStatusType invalid, Pageable pageable);

}
