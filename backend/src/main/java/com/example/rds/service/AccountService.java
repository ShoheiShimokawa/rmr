package com.example.rds.service;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.rds.context.AccountRepository;
import com.example.rds.model.Account;
import com.example.rds.model.Account.RegisterAccount;
import com.example.rds.model.Account.UpdateProfile;
import com.example.rds.util.BadRequestException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AccountService {
	private final AccountRepository rep;
	
	/** ユーザ情報を返します。 */
	public Optional<Account> getProfile(Integer userId) {
		return Account.getProfile(userId, rep);
	}

	/** ハンドルに紐づくユーザを返します。 */
	public Optional<Account> getByHandle(String handle) {
		return Account.getByHandle(rep, handle);
	}

	/** 自ユーザ情報を返します。(ログイン時) */
	public Optional<Account>get(String sub){
		return Account.get(sub, rep);
	}
	
	/** アカウントをアプリに登録します。 */
	public Account register(RegisterAccount params) {
		rep.findByHandle(params.handle()).ifPresent(existing -> {
       if (!existing.getGoogleSub().equals(params.googleSub())) {
    throw new BadRequestException("This handle is already taken.");
}
    });
	Account user = Account.builder()
			.handle(params.handle())
			.name(params.name())
			.picture(params.picture())
			.googleSub(params.googleSub())
			.RegisterDate(LocalDate.now())
			.build();
		return Account.register(rep, user);
	}
	
	/** アカウント情報を更新します。 */
	public Account update( UpdateProfile params) {
		return Account.update(rep,params);
	}
}
