package com.example.rds.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.rds.model.Good;
import com.example.rds.model.Post;
import com.example.rds.model.Post.PostWithGoodCount;
import com.example.rds.model.Post.YearlyPostRecord;
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
	public List<PostWithGoodCount> getPostAll() {
		return service.getPostAll();
	}

	@GetMapping("/post/book/id")
	public List<Post> findPostByBookId(@RequestParam String id) {
		return service.findById(id);
	}

	@GetMapping("/post/user")
	public List<PostWithGoodCount> getPostAllByUser(Integer userId) {
		return service.getPostAllByUser(userId);
	}

	@GetMapping("/post/good")
	public List<Good> getGooder(Integer postId) {
		return goService.getGooder(postId);
	}

	@GetMapping("/post/good/user")
	public List<Good> getGoodPostAll(Integer userId) {
		return goService.getGoodPostAll(userId);
	}

	@GetMapping("/post/record")
	public List<YearlyPostRecord> getPostRecord(@RequestParam Integer userId) {
		return service.getPostRecord(userId);
	}

	@PostMapping("/post/good")
	public Good good(@RequestBody SpecifyGood params) {
		return goService.good(params.postId, params.userId);
	}

	@PostMapping("/post/good/delete")
	public ResponseEntity<Void> delete(@RequestBody SpecifyGood params) {
		goService.delete(params.postId, params.userId);
		return ResponseEntity.ok().build();
	}
	public static record SpecifyGood(Integer postId,Integer userId) {
    }

}
