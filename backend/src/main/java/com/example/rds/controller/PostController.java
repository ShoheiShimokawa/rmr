package com.example.rds.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.rds.model.Post;
import com.example.rds.service.PostService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api")
public class PostController {
	private final PostService service;
	
	@GetMapping("/post")
	public List<Post>getPostAll(Integer userId){
		return service.getPostAll(userId);
	}
	
}
