package com.rmr.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rmr.backend.model.Book;
import com.rmr.backend.service.BookDiscoveryService;

import lombok.RequiredArgsConstructor;

/** /bookページの発見セクション(評価の高い本・今読まれている本・フォロー中の人の本)のエンドポイント。 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/books")
public class BookDiscoveryController {

    private final BookDiscoveryService service;

    @GetMapping("/top-rated")
    public Map<String, List<Book.Ranked>> topRated() {
        return Map.of("items", service.topRated());
    }

    @GetMapping("/popular")
    public Map<String, List<Book.Ranked>> popular() {
        return Map.of("items", service.popular());
    }

    /** フォロー中の人の最近の読書。未ログインなら空を返す(認証は必須にしない)。 */
    @GetMapping("/following")
    public Map<String, List<Book.FollowingActivity>> following(@AuthenticationPrincipal Integer currentUserId) {
        return Map.of("items", service.following(currentUserId));
    }
}
