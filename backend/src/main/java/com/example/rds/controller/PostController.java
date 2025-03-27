package com.example.rds.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.rds.model.Good;
import com.example.rds.model.Post;
import com.example.rds.model.Post.PostWithUser;
import com.example.rds.service.GoodService;
import com.example.rds.service.PostService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api")
public class PostController {
	private final PostService service;
	private final GoodService goService;

	@GetMapping("/post")
	public List<Post> getPostAll(Integer userId) {
		return service.getPostAll(userId);
	}

	@GetMapping("/post/user")
	public List<PostWithUser> getPostAllByUser(Integer userId) {
		return service.getPostAllByUser(userId);
	}

	@GetMapping("/post/good")
	public List<Good> getGooder(Integer postId) {
		return goService.getGooder(postId);
	}

	@PostMapping("/post/good")
	public Good good(Integer postId, Integer userId) {
		return goService.good(postId, userId);
	}

}
