package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.TestEntitlement;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;

public interface TestEntitlementRepository extends BaseRepository<TestEntitlement, String> {
    boolean existsByUser_IdAndTest_Id(String userId, String testId);
}
