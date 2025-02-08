package com.example.rds.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.rds.model.Account;
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

	@GetMapping("/account/follow")
	public List<Follow> getFollower(Integer userId) {
		return foService.getFollower(userId);
	}

	@PostMapping("/account/follow")
	public Follow follow(Integer userId, Integer followerId) {
		return foService.follow(userId, followerId);
	}

}
