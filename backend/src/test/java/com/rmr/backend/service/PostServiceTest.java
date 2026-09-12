package com.rmr.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.rmr.backend.context.GoodRepository;
import com.rmr.backend.context.PostRepository;
import com.rmr.backend.model.Post;
import com.rmr.backend.model.Post.PostWithGoodCount;

class PostServiceTest {

	@Test
	void findByBookIdOrIsbnPassesIdAndIsbnToRepository() {
		PostRepository rep = mock(PostRepository.class);
		GoodRepository gRep = mock(GoodRepository.class);
		Post post = Post.builder().postId(1).build();
		when(rep.findByBookIdOrIsbn("new-source-id", "9784000000001")).thenReturn(List.of(post));
		when(gRep.countGroupByPostIdRaw()).thenReturn(Collections.emptyList());

		PostService service = new PostService(rep, gRep);
		List<PostWithGoodCount> result = service.findByBookIdOrIsbn("new-source-id", "9784000000001");

		assertThat(result).extracting(PostWithGoodCount::getPostId).containsExactly(1);
	}
}
