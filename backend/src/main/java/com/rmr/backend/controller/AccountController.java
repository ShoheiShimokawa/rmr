package com.rmr.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
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
	public Account register(@RequestBody RegisterAccount params) {
		return service.register(params);
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
	public Follow follow(@RequestBody SpecifyFollow params) {
		return foService.follow(params.userId, params.followerId);
	}

	@PostMapping("account/update")
	public Account updateProfile(@RequestBody UpdateProfile params) {
		return service.update(params);
	}

	@PostMapping("/account/follow/delete")
	public ResponseEntity<Void> delete(@RequestBody SpecifyFollowId param) {
		this.foService.delete(param.id);
		return ResponseEntity.ok().build();
	}



	public static record SpecifyFollowId(Integer id) {
    }
	public static record SpecifyFollow(Integer userId,Integer followerId) {
    }

}
