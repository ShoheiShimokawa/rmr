package com.example.rds.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.rds.context.GoodRepository;
import com.example.rds.model.Good;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GoodService {
    private final GoodRepository rep;

    /** ポストにいいねします。 */
    public Good good(Integer postId, Integer userId) {
        return Good.good(rep, postId, userId);
    }

    /** ポストにいいねした人を返します。 */
    public List<Good> getGooder(Integer postId) {
        return Good.getGooder(rep, postId);
    }
}
