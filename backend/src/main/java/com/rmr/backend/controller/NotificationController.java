package com.rmr.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rmr.backend.model.Notification;
import com.rmr.backend.service.NotificationService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api")
public class NotificationController {
    private final NotificationService service;

    @GetMapping("/notification")
    public List<Notification> getPostAll(@RequestParam Integer userId) {
        return service.getAll(userId);
    }

    @PostMapping("/notification")
    public ResponseEntity<Void> markAllAsDone(@RequestBody SpecifyUserId params) {
        service.markAllAsDone(params.userId);
        return ResponseEntity.ok().build();
    }
    public static record SpecifyUserId(Integer userId) {
    }

}
