package com.rmr.backend.model;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.util.BadRequestException;

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
	/** X */
	private String x;
	/** FaceBook */
	private String facebook;
	/** リンク */
	private String link;
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
	
	
	/** アカウントを登録します。 */
	public static Account register(AccountRepository rep, Account account) {
		return rep.save(account);
	}
	
		public static record RegisterAccount(
			String googleSub,
			String handle,
			String name,
			String picture
			) {
    }
	
	/** プロフィールを変更します。*/
	public static Account update(AccountRepository rep,UpdateProfile params) {
		Account user = rep.findByUserId(params.userId).orElseThrow(() -> new EntityNotFoundException("user not found"));
		rep.findByHandle(params.handle).ifPresent(existing -> {
       if (!existing.getUserId().equals(params.userId)) {
    throw new BadRequestException("This handle is already taken.");
}
    });
		user.setHandle(params.handle);
		user.setName(params.name);
		user.setDescription(params.description);
		user.setX(params.x);
		user.setFacebook(params.facebook);
		user.setLink(params.link);
		return rep.save(user);
	}

	/** 変更パラメタ(vscodeでrecordに@Builder使うと作動しないため暫定対応) */
	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class UpdateProfile {
		private Integer userId;
		private String handle;
		private String name;
		private String description;
		private String x;
		private String facebook;
		private String link;

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
