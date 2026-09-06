package com.rmr.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.LabelRepository;
import com.rmr.backend.context.MemoRepository;
import com.rmr.backend.context.ReadingRepository;
import com.rmr.backend.model.Label;
import com.rmr.backend.model.Memo;
import com.rmr.backend.model.Memo.ReadingMemoGroup;
import com.rmr.backend.model.Memo.RegisterMemo;
import com.rmr.backend.model.Reading;

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
    
    /** メモを登録します。(自分の読書に対してのみ) */
    public Memo register(Integer currentUserId, RegisterMemo params) {
        Reading reading = Reading.get(rRep, params.getReadingId());
        if (!reading.getUser().getUserId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this reading.");
        }
        params.setUserId(currentUserId);
        Label label=Label.findOrRegister(lRep,aRep,params.getUserId(), params.getLabel());
        return Memo.register(rep,rRep, params,label);
    }

    
}
