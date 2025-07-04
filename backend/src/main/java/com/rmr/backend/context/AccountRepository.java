package com.rmr.backend.context;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.rmr.backend.model.Account;

public interface AccountRepository extends JpaRepository<Account,Integer>{
	/** ハンドルが存在しているか確認します。 */
	@Query("SELECT a FROM Account a WHERE a.handle = :handle")
	Optional<Account> findByHandle(@Param("handle")String handle);
	
	@Query("SELECT a FROM Account a WHERE a.googleSub = :sub")
	Optional<Account>findByGoogleSub(@Param("sub")String sub);

	/** userIdでアカウント情報を検索します。 */
	@Query("SELECT a FROM Account a WHERE a.userId = :userId")
	Optional<Account>findByUserId(@Param("userId")Integer userId);
}
