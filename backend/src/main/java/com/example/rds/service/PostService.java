package com.example.rds.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.rds.context.PostRepository;
import com.example.rds.model.Post;
import com.example.rds.model.Post.YearlyPostRecord;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService {
	private final PostRepository rep;
	
	/** ユーザに紐づくポストを全て返します。 */
	public List<Post> getPostAllByUser(Integer userId) {
		return Post.getPostAllByUser(rep, userId);
	}

	/** ID(google)に紐付くポストを全て返します。 */
	public List<Post> findById(String id) {
		return Post.findById(rep,id);
	}

	/** ポストを返却します。（タイムライン用） */
	public List<Post> getPostAll(Integer userId) {
		return Post.getPostAll(rep, userId);
	}

	/** 年間ポスト数を返します。 */
	public List<YearlyPostRecord> getPostRecord(Integer userId) {
		return Post.getPostRecord(rep, userId);
	}

}
