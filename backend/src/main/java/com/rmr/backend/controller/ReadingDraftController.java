package com.rmr.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rmr.backend.model.ReadingDraft;
import com.rmr.backend.model.ReadingDraft.SaveReadingDraft;
import com.rmr.backend.model.ReadingDraft.SpecifyBookId;
import com.rmr.backend.service.ReadingDraftService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api")
public class ReadingDraftController {
	private final ReadingDraftService service;

	@GetMapping("/reading/draft")
	public List<ReadingDraft> find(@AuthenticationPrincipal Integer currentUserId) {
		return service.findByUserId(currentUserId);
	}

	@PostMapping("/reading/draft")
	public ReadingDraft save(@AuthenticationPrincipal Integer currentUserId, @RequestBody SaveReadingDraft params) {
		return service.save(currentUserId, params);
	}

	@PostMapping("/reading/draft/delete")
	public ResponseEntity<Void> delete(@AuthenticationPrincipal Integer currentUserId, @RequestBody SpecifyBookId params) {
		service.delete(currentUserId, params.bookId());
		return ResponseEntity.ok().build();
	}
}
