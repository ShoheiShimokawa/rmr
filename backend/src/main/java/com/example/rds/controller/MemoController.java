package com.example.rds.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.rds.model.Memo;
import com.example.rds.model.Memo.ReadingMemoGroup;
import com.example.rds.model.Memo.RegisterMemo;
import com.example.rds.service.MemoService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api")
public class MemoController {
    private final MemoService service;

 @GetMapping("/memo/id")
    public Memo getById(@RequestParam Integer memoId) {
        return service.getById(memoId);
    }

    // @GetMapping("/memo")
    // public List<Memo> get(Integer userId) {
    //     return service.get(userId);
    // }
    
    @GetMapping("/memo")
    public List<ReadingMemoGroup> get(@RequestParam Integer userId) {
        return service.getGroupedMemos(userId);
    }
    
     @PostMapping("/memo")
     public Memo register(@RequestBody RegisterMemo params) {
         return this.service.register(params);
     }
    
     
}
