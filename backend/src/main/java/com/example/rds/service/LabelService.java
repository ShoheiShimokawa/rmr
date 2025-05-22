package com.example.rds.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.rds.context.LabelRepository;
import com.example.rds.model.Label;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LabelService {
    private final LabelRepository rep;
      
    /** ユーザに紐づくラベルを返します。 */
    public List<Label> get(Integer userId) {
        return Label.get(rep, userId);
    }
}
