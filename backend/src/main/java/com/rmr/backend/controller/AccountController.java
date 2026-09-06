package com.rmr.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rmr.backend.model.Account;
import com.rmr.backend.model.Account.RegisterAccount;
import com.rmr.backend.model.Account.UpdateProfile;
import com.rmr.backend.model.Follow;
import com.rmr.backend.service.AccountService;
import com.rmr.backend.service.AccountService.RegisterResult;
import com.rmr.backend.service.FollowService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api")
public class AccountController {
	private final AccountService service;
	private final FollowService foService;

	@GetMapping("/account")
	public Optional<Account> getProfile(@RequestParam Integer userId) {
		return service.getProfile(userId);
	}

	@GetMapping("/account/handle")
	public Optional<Account> getByHandle(@RequestParam String handle) {
		return service.getByHandle(handle);
	}

	@PostMapping("account/register")
	public Map<String, Object> register(@RequestBody RegisterAccount params) {
		RegisterResult result = service.register(params);
		return Map.of("user", result.user(), "sessionToken", result.sessionToken());
	}

	@GetMapping("/account/follower")
	public List<Follow> getFollower(@RequestParam Integer userId) {
		return foService.getFollower(userId);
	}

	@GetMapping("/account/follow")
	public List<Follow> getFollow(@RequestParam Integer followerId){
		return foService.getFollow(followerId);
	}

	@PostMapping("/account/follow")
	public Follow follow(@AuthenticationPrincipal Integer currentUserId, @RequestBody SpecifyFollow params) {
		return foService.follow(params.userId, currentUserId);
	}

	@PostMapping("account/update")
	public Account updateProfile(@AuthenticationPrincipal Integer currentUserId, @RequestBody UpdateProfile params) {
		return service.update(currentUserId, params);
	}

	@PostMapping("/account/follow/delete")
	public ResponseEntity<Void> delete(@AuthenticationPrincipal Integer currentUserId, @RequestBody SpecifyFollowId param) {
		this.foService.delete(param.id, currentUserId);
		return ResponseEntity.ok().build();
	}



	public static record SpecifyFollowId(Integer id) {
    }
	/** フォロー対象のユーザ。フォロワー自身(followerId)は認証済みトークンから復元するためクライアント入力は使わない。 */
	public static record SpecifyFollow(Integer userId) {
    }

}
