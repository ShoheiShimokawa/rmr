package com.example.rds.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.rds.model.Label;
import com.example.rds.service.LabelService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api")
public class LabelController {
    private final LabelService service;

    @GetMapping("/label")
	public List<Label> get(Integer userId) {
		return service.get(userId);
	}
}
