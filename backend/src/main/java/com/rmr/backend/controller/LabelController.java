package com.rmr.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rmr.backend.model.Label;
import com.rmr.backend.service.LabelService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api")
public class LabelController {
    private final LabelService service;

    @GetMapping("/label")
	public List<Label> get(Integer userId) {
		return service.get(userId);
	}
}
