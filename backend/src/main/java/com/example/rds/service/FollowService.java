package com.example.rds.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.rds.context.FollowRepository;
import com.example.rds.model.Follow;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FollowService {
    private final FollowRepository rep;

    /** ユーザをフォローします。 */
    // public Follow follow(Integer userId, Integer followerId) {
    //     return Follow.follow(rep, userId, followerId);
    // }

    /** フォロワーを返します。 */
    public List<Follow> getFollower(Integer userId) {
        return Follow.getFollower(rep, userId);
    }

    /** フォローしている人を返します。 */
    public List<Follow> getFollow(Integer followerId){
        return Follow.getFollow(rep,followerId);
    }
}
