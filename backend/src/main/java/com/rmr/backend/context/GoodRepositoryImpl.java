package com.rmr.backend.context;


import java.util.List;

import org.springframework.stereotype.Repository;

import com.rmr.backend.model.Good;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;

@Repository
public class GoodRepositoryImpl implements GoodRepositoryCustom {
     @PersistenceContext
     private EntityManager entityManager;
    
    @Override
    public List<Good> findByPostId(Integer postId) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Good> cq = cb.createQuery(Good.class);
        Root<Good> good = cq.from(Good.class);

        // Good.post から postId を参照（JOIN不要、単純な内部参照でOK）
        cq.where(cb.equal(good.get("post").get("postId"), postId));

        return entityManager.createQuery(cq).getResultList();
    }
}
