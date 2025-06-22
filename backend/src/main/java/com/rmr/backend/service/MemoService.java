package com.rmr.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.LabelRepository;
import com.rmr.backend.context.MemoRepository;
import com.rmr.backend.context.ReadingRepository;
import com.rmr.backend.model.Label;
import com.rmr.backend.model.Memo;
import com.rmr.backend.model.Memo.ReadingMemoGroup;
import com.rmr.backend.model.Memo.RegisterMemo;

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
        Label label=Label.findOrRegister(lRep,aRep,params.getUserId(), params.getLabel());
        return Memo.register(rep,rRep, params,label);
    }

    
}
