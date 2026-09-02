package com.rmr.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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
    public List<Notification> getPostAll(@AuthenticationPrincipal Integer currentUserId) {
        return service.getAll(currentUserId);
    }

    @PostMapping("/notification")
    public ResponseEntity<Void> markAllAsDone(@AuthenticationPrincipal Integer currentUserId) {
        service.markAllAsDone(currentUserId);
        return ResponseEntity.ok().build();
    }

}
