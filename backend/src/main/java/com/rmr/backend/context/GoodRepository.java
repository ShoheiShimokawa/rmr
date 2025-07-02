package com.rmr.backend.context;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.rmr.backend.model.Good;

public interface GoodRepository extends JpaRepository<Good, Integer> {
    @Query("SELECT g FROM Good g WHERE g.post.postId = :postId")
    List<Good> findByPostId(@Param("postId") Integer postId);

     @Query("SELECT g FROM Good g WHERE g.user.userId = :userId")
     List<Good> findByUserId(@Param("userId") Integer userId);
    
     Optional<Good> findByPostPostIdAndUserUserId(Integer postId, Integer userId);

    @Query("SELECT g.post.postId, COUNT(g) FROM Good g WHERE g.statusType=1 GROUP BY g.post.postId")
    List<Object[]> countGroupByPostIdRaw();
    /** PostId,いいね数をMapで返します。 */
    default Map<Integer, Long> countGroupByPostId() {
    List<Object[]> raw = countGroupByPostIdRaw();
    return raw.stream().collect(Collectors.toMap(
        row -> (Integer) row[0],
        row -> (Long) row[1]
    ));
}

}
