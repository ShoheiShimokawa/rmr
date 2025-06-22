package com.rmr.backend.context;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.rmr.backend.model.Memo;

public interface MemoRepository extends JpaRepository<Memo,Integer>{
    
    @Query("SELECT m FROM Memo m WHERE m.user.userId = :userId")
    List<Memo> findByUserId(@Param("userId") Integer userId);
    


}
