package com.rmr.backend.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rmr.backend.model.Memo.HighlightView;
import com.rmr.backend.model.Memo.RegisterHighlight;
import com.rmr.backend.model.Memo.SpecifyMemoId;
import com.rmr.backend.model.Memo.UpdateHighlight;
import com.rmr.backend.service.MemoService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api")
public class MemoController {
    private final MemoService service;

    @GetMapping("/memo")
    public List<HighlightView> get(@RequestParam Integer userId, @AuthenticationPrincipal Integer currentUserId) {
        return service.findByUser(userId, currentUserId);
    }

    @GetMapping("/memo/id")
    public HighlightView getById(@RequestParam Integer memoId, @AuthenticationPrincipal Integer currentUserId) {
        return service.findById(memoId, currentUserId);
    }

    @PostMapping("/memo")
    public HighlightView register(@AuthenticationPrincipal Integer currentUserId, @RequestBody RegisterHighlight params) {
        return service.register(currentUserId, params);
    }

    @PostMapping("/memo/update")
    public HighlightView update(@AuthenticationPrincipal Integer currentUserId, @RequestBody UpdateHighlight params) {
        return service.update(currentUserId, params);
    }

    @PostMapping("/memo/delete")
    public void delete(@AuthenticationPrincipal Integer currentUserId, @RequestBody SpecifyMemoId params) {
        service.delete(currentUserId, params.memoId());
    }
}
