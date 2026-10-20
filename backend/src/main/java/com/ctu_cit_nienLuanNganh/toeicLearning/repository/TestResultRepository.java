package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.TestResult;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestResultRepository extends BaseRepository<TestResult, String> {
    // Dành cho ProfilePage: Lấy toàn bộ lịch sử thi của học viên, mới nhất xếp trước
    List<TestResult> findByUserIdOrderByCreatedAtDesc(String userId);

    // Dành cho CourseDetailPage: Lọc lịch sử theo từng đề cụ thể của học viên
    List<TestResult> findByUserIdAndTestIdOrderByCreatedAtDesc(String userId, String testId);
}
