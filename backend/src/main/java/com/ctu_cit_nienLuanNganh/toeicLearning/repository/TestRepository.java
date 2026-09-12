package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TestStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Test;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TestRepository extends BaseRepository<Test, String>{
    Page<Test> findByStatus(TestStatus status, Pageable pageable);
    Page<Test> findByTitleTestContainingIgnoreCaseAndStatus(String titleTest, TestStatus status, Pageable pageable);
}
