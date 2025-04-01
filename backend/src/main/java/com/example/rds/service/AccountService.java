package com.example.rds.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.rds.context.AccountRepository;
import com.example.rds.model.Account;

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
	public Account register(AccountRepository rep,Account account) {
		return Account.register(rep, account);
	}
}
