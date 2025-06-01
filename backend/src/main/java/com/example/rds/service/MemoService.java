package com.example.rds.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.rds.context.AccountRepository;
import com.example.rds.context.LabelRepository;
import com.example.rds.context.MemoRepository;
import com.example.rds.context.ReadingRepository;
import com.example.rds.model.Label;
import com.example.rds.model.Memo;
import com.example.rds.model.Memo.ReadingMemoGroup;
import com.example.rds.model.Memo.RegisterMemo;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemoService {
    private final MemoRepository rep;
    private final AccountRepository aRep;
    private final ReadingRepository rRep;
    private final LabelRepository lRep;

    public Memo getById(Integer memoId) {
        return Memo.getById(rep, memoId).orElseThrow(() -> new EntityNotFoundException("Memo not found"));
    }

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
        Label label=Label.findOrRegister(lRep,aRep,params.userId(), params.label());
        return Memo.register(rep,rRep, params,label);
    }

    
}
