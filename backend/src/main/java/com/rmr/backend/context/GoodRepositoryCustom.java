package com.rmr.backend.context;

import java.util.List;

import com.rmr.backend.model.Good;

public interface GoodRepositoryCustom {
    List<Good> findByPostId(Integer postId);
}
