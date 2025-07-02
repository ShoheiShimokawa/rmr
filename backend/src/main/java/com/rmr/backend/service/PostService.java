package com.rmr.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.rmr.backend.context.GoodRepository;
import com.rmr.backend.context.PostRepository;
import com.rmr.backend.model.Post;
import com.rmr.backend.model.Post.PostWithGoodCount;
import com.rmr.backend.model.Post.YearlyPostRecord;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService {
	private final PostRepository rep;
	private final GoodRepository gRep;
	
	/** ユーザに紐づくポストを全て返します。(いいね数含む) */
	public List<PostWithGoodCount> getPostAllByUser(Integer userId) {
		return Post.getPostWithGoodCount(rep, gRep,userId);
	}

	/** ID(google)に紐付くポストを全て返します。 */
	public List<PostWithGoodCount>  findById(String id) {
		return Post.findById(rep,gRep,id);
	}

	/** ポストを返却します。（タイムライン用） */
	public List<PostWithGoodCount> getPostAll() {
		return Post.getPostAll(rep,gRep);
	}

	/** 年間ポスト数を返します。 */
	public List<YearlyPostRecord> getPostRecord(Integer userId) {
		return Post.getPostRecord(rep, userId);
	}

}
