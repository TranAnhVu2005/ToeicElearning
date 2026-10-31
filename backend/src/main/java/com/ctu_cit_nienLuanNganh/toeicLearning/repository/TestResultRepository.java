package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.TestResult;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TestResultRepository extends BaseRepository<TestResult, String> {
    // Dành cho ProfilePage: Lấy toàn bộ lịch sử thi của học viên, mới nhất xếp trước
    List<TestResult> findByUserIdOrderByCreatedAtDesc(String userId);

    // Dành cho CourseDetailPage: Lọc lịch sử theo từng đề cụ thể của học viên
    List<TestResult> findByUserIdAndTestIdOrderByCreatedAtDesc(String userId, String testId);
    Optional<TestResult> findByIdAndUserId(String id, String userId);
    Optional<TestResult> findBySubmissionKeyAndUserId(String submissionKey, String userId);
    boolean existsByTestId(String testId);
    List<TestResult> findByAssignmentIdAndUserIdOrderByCreatedAtDesc(String assignmentId, String userId);
    List<TestResult> findByAssignmentIdOrderByCreatedAtDesc(String assignmentId);

    @Query("SELECT SUM(r.totalScore), COUNT(r) FROM TestResult r " +
            "WHERE r.assignment.id = :assignmentId AND r.user.id IN :studentIds " +
            "AND r.teacherComment IS NOT NULL AND TRIM(r.teacherComment) <> '' AND r.totalScore IS NOT NULL")
    Object[] summarizeReviewedScores(@Param("assignmentId") String assignmentId,
                                     @Param("studentIds") java.util.Collection<String> studentIds);

    @Query("SELECT COUNT(r) FROM TestResult r WHERE r.createdAt >= :from AND r.createdAt < :to")
    long countSubmittedBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query(value = "SELECT DATE(created_at) AS metric_date, COUNT(*) AS attempt_count " +
            "FROM test_result WHERE created_at >= :from AND created_at < :to " +
            "GROUP BY DATE(created_at) ORDER BY DATE(created_at)", nativeQuery = true)
    List<Object[]> countSubmittedByDay(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
