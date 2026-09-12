package com.rmr.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rmr.backend.model.Reading;
import com.rmr.backend.model.Reading.MonthlyReading;
import com.rmr.backend.model.Reading.RegisterReading;
import com.rmr.backend.model.Reading.UpdateReading;
import com.rmr.backend.service.ReadingService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api")
public class ReadingController {
	private final ReadingService service;
	
	@GetMapping("/reading/book")
	public List<Reading> findByBookId(@RequestParam Integer id) {
		return service.findByBookId(id);
	}

	
@GetMapping("/reading/book/user")
	public Reading getByUserIdAndBookId(@RequestParam Integer userId,
    @RequestParam Integer bookId) {
		return service.getByUserIdAndBookId(userId,bookId);
	}
	@GetMapping("/reading/id/book")
	public List<Reading> findById(@RequestParam String id, @RequestParam(required = false) String isbn) {
		return service.findByBookIdOrIsbn(id, isbn);
	}
	
	@GetMapping("/reading")
	public List<Reading> findReadingsByUserId(@RequestParam Integer userId){
		return service.findReadingsByUserId(userId);
	}
	
	@PostMapping("/reading")
	public Reading register(@AuthenticationPrincipal Integer currentUserId, @RequestBody RegisterReading params) {
		params.setUserId(currentUserId);
		return this.service.register(params);
	}

	@PostMapping("/reading/update")
	public Reading update(@AuthenticationPrincipal Integer currentUserId, @RequestBody UpdateReading params) {
		return this.service.update(currentUserId, params);
	}

	@PostMapping("/reading/doing")
	public Reading toDoing(@AuthenticationPrincipal Integer currentUserId, @RequestBody SpecifyReadingId params) {
		return this.service.toDoing(params.readingId, currentUserId);
	}

	@PostMapping("/reading/delete")
	public ResponseEntity<Void> delete(@AuthenticationPrincipal Integer currentUserId, @RequestBody SpecifyReadingId params) {
		this.service.delete(params.readingId, currentUserId);
		return ResponseEntity.ok().build();
	}
	//POSTはDTO作る必要あり
	public static record SpecifyReadingId(Integer readingId) {
    }
	
	@GetMapping("/analytics")
	public List<MonthlyReading> getMonthlyReading(@RequestParam Integer userId){
		return this.service.getMonthlyReading(userId);
	}
}
