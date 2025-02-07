package com.example.rds.controller;

import java.util.Optional;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.rds.model.Account;
import com.example.rds.service.AccountService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api")
public class AccountController {
	private final AccountService service;
	
	@GetMapping("/account")
	public Optional<Account>getProfile(Integer userId){
		return service.getProfile(userId);
	}
	
}
