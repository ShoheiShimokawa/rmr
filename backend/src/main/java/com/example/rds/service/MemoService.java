package com.example.rds.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.rds.context.LabelRepository;
import com.example.rds.context.MemoRepository;
import com.example.rds.context.ReadingRepository;
import com.example.rds.model.Memo;
import com.example.rds.model.Memo.ReadingMemoGroup;
import com.example.rds.model.Memo.RegisterMemo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemoService {
    private final MemoRepository rep;
    private final ReadingRepository rRep;
    private final LabelRepository lRep;

    /** ユーザに紐づくメモを返します。 */
    public List<Memo> get(Integer userId) {
        return Memo.get(rep, userId);
    }

    /** ラベリングされたメモを返します。 */
    public List<ReadingMemoGroup> getGroupedMemos(Integer userId) {
        return Memo.getGroupedMemos(rep, userId);
    }
    
    /** メモを登録します。 */
    public Memo register(RegisterMemo params) {
        return Memo.register(rep, rRep, lRep, params);
    }

    
}
