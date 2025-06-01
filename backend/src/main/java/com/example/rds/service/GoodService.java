package com.example.rds.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.rds.context.GoodRepository;
import com.example.rds.context.PostRepository;
import com.example.rds.model.Good;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GoodService {
    private final GoodRepository rep;
    private final PostRepository pRep;

    /** ポストにいいねします。 */
    public Good good(Integer postId, Integer userId) {
        return Good.good(rep,pRep, postId, userId);
    }

    /** いいねを取り消します */
    public void delete(Integer postId, Integer userId) {
        Good.delete(rep, postId, userId);
    }

    /** ポストにいいねした人を返します。 */
    public List<Good> getGooder(Integer postId) {
        return Good.getGooder(rep, postId);
    }

    /** 自分がいいねしたポストを返します。 */
    public List<Good> getGoodPostAll(Integer userId) {
        return Good.getGoodPostAll(rep, userId);
    }
}
