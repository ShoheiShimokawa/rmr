package com.example.rds.model;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.example.rds.context.AccountRepository;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Account {
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Id
	private Integer userId;
	/**  googleのsub*/
	private String googleSub;
	/** ユーザ発行ハンドル */
	@NotNull
	private String handle;
	/** 表示名 */
	private String name;
	/** サムネイル */
	private String picture;
	/** メール */
	private String email;
	/** 自己紹介文 */
	private String description;
	/** 登録日 */
	private LocalDate RegisterDate;
	/** 更新日 */
	private LocalDate UpdateDate;
	
	/** ユーザを返します。 */
	public static Optional<Account> get(AccountRepository rep, Integer userId) {
		return rep.findByUserId(userId);
	}
	
	/** ハンドルに紐づくユーザを返します。 */
	public static Optional<Account> getByHandle(AccountRepository rep,String handle) {
		return rep.findByHandle(handle);
	}

	/** 全てのユーザを返します。*/
	public static List<Account> getAll(AccountRepository rep) {
		return rep.findAll();
	}
	
	/** ハンドルを発行します。 */
	// public static Account registerHandle(AccountRepository rep,Integer userId,String handle) {
	// 	var a=rep.findByHandle(handle);
	// 	if(a.isPresent()) {
	// 		return "すでに存在しているIDです。";
	// 	} else {
	// 		var b = rep.findByUserId(userId).orElseThrow(() -> new EntityNotFoundException("good not found"));
	// 		b.setHandle(handle);
	// 	return rep.save(b);
	// 	}
	// };
	
	/** アカウントを登録します。 */
	public static Account register(AccountRepository rep, Account account) {
		return rep.save(account);
	}
	
		public static record RegisterAccount(
			String googleSub,
			String handle,
			String name,
			String picture,
			String email) {
    }
	
	
	/** プロフィールを変更します。（初期段階は自己紹介文のみ）*/
	public static Account update(AccountRepository rep,UpdateProfile params) {
		var user=rep.findByUserId(params.userId).orElseThrow(() -> new EntityNotFoundException("user not found"));
		user.setName(params.name);
		user.setDescription(params.description);
		return rep.save(user);
	}

	/** 変更パラメタ(vscodeでrecordに@Bui;der使うと作動しないため暫定対応) */
	@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public static class UpdateProfile {
	private Integer userId;
	private String name;
	private String description;

	public Account create() {
		return Account.builder()
			.userId(this.userId)
			.name(this.name)
			.description(this.description)
			.build();
	}
}
	/** プロフィール情報を返します。 */
	public static Optional<Account> getProfile(Integer userId,AccountRepository rep) {
		return rep.findById(userId);
	}
	
	/** 自プロフィール情報を返します。 */
	public static Optional<Account> get(String sub,AccountRepository rep){
		return rep.findByGoogleSub(sub);
	}
	
	
}
