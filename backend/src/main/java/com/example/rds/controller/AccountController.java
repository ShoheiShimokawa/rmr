package com.example.rds.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.rds.model.Account;
import com.example.rds.model.Account.UpdateProfile;
import com.example.rds.model.Follow;
import com.example.rds.service.AccountService;
import com.example.rds.service.FollowService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api")
public class AccountController {
	private final AccountService service;
	private final FollowService foService;

	@GetMapping("/account")
	public Optional<Account> getProfile(Integer userId) {
		return service.getProfile(userId);
	}

	@GetMapping("/account/handle")
	public Optional<Account> getByHandle(String handle) {
		return service.getByHandle(handle);
	}

	@GetMapping("/account/follower")
	public List<Follow> getFollower(Integer userId) {
		return foService.getFollower(userId);
	}

	@GetMapping("/account/follow")
	public List<Follow> getFollow(Integer followerId){
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
