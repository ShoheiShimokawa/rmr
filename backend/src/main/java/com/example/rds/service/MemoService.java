package com.example.rds.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.rds.context.MemoRepository;
import com.example.rds.model.Memo;
import com.example.rds.model.Memo.ReadingMemoGroup;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemoService {
    private final MemoRepository rep;

    /** ユーザに紐づくメモを返します。 */
    public List<Memo> get(Integer userId) {
        return Memo.get(rep, userId);
    }

    /** ラベリングされたメモを返します。 */
    public List<ReadingMemoGroup> getGroupedMemos(Integer userId) {
        return Memo.getGroupedMemos(rep,userId);
    }
}
