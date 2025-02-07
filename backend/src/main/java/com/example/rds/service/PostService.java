package com.example.rds.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.rds.context.PostRepository;
import com.example.rds.model.Post;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService {
	private final PostRepository rep;
	
	/** ユーザに紐づくポストを全て返します。 */
	public List<Post>getPostAll(Integer userId){
		return Post.getPostAll(rep, userId);
	}
}
