package com.rmr.backend.service;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.model.Account;
import com.rmr.backend.model.Account.RegisterAccount;
import com.rmr.backend.model.Account.UpdateProfile;
import com.rmr.backend.security.JwtService;
import com.rmr.backend.security.JwtService.RegistrationClaims;
import com.rmr.backend.util.BadRequestException;

import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AccountService {
	private final AccountRepository rep;
	private final JwtService jwtService;

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

	/** アカウントをアプリに登録します。registrationTokenを検証し、Google情報をそこから復元します
	 * (クライアントが送ってくるgoogleSub/name/pictureは一切信用しない)。 */
	public RegisterResult register(RegisterAccount params) {
		RegistrationClaims claims;
		try {
			claims = jwtService.parseRegistrationToken(params.registrationToken());
		} catch (JwtException e) {
			throw new BadRequestException("Registration session has expired. Please sign in again.");
		}
		rep.findByHandle(params.handle()).ifPresent(existing -> {
       if (!existing.getGoogleSub().equals(claims.googleSub())) {
    throw new BadRequestException("This handle is already taken.");
}
    });
	Account user = Account.builder()
			.handle(params.handle())
			.name(claims.name())
			.picture(claims.picture())
			.googleSub(claims.googleSub())
			.RegisterDate(LocalDate.now())
			.build();
		Account saved = Account.register(rep, user);
		String sessionToken = jwtService.createSessionToken(saved.getUserId());
		return new RegisterResult(saved, sessionToken);
	}

	/** アカウント情報を更新します。(currentUserIdは認証済みトークンから復元した本人ID) */
	public Account update(Integer currentUserId, UpdateProfile params) {
		return Account.update(rep, currentUserId, params);
	}

	public record RegisterResult(Account user, String sessionToken) {
	}
}
