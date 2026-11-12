package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.TestComment;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TestCommentRepository extends BaseRepository<TestComment, String> {

    @Query("SELECT c FROM TestComment c JOIN FETCH c.user u LEFT JOIN FETCH u.role WHERE c.test.id = :testId ORDER BY c.createdAt DESC")
    List<TestComment> findByTestIdWithUser(@Param("testId") String testId);

    long countByTestId(String testId);
}

