package com.example.rds.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.rds.context.AccountRepository;
import com.example.rds.context.LabelRepository;
import com.example.rds.model.Label;
import com.example.rds.model.Label.RegisterLabel;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LabelService {
    private final LabelRepository rep;
    private final AccountRepository aRep;
      
    /** ユーザに紐づくラベルを返します。 */
    public List<Label> get(Integer userId) {
        return Label.get(rep, userId);
    }
    /** ラベルを登録します。（すでに存在していればそのまま返却します） */
    //TODO;なんだか若干使い勝手が悪い気がするので、後ほど重複チェックと登録はメソッドを分離
    public Label findOrRegister(Integer userId,String label) {
        return Label.findOrRegister(rep, aRep,userId,label);
    }
}
