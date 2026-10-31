package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ExamSessionStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.ExamSession;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.time.LocalDateTime;
import java.util.List;

public interface ExamSessionRepository extends JpaRepository<ExamSession, String> {
    @Query("SELECT COUNT(s) FROM ExamSession s WHERE s.startedAt >= :from AND s.startedAt < :to")
    long countStartedBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query(value = "SELECT DATE(started_at) AS metric_date, COUNT(*) AS attempt_count "
            + "FROM exam_session WHERE started_at >= :from AND started_at < :to "
            + "GROUP BY DATE(started_at) ORDER BY DATE(started_at)", nativeQuery = true)
    List<Object[]> countStartedByDay(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    Optional<ExamSession> findFirstByUser_IdAndScopeKeyAndStatusOrderByCreatedAtDesc(
            String userId, String scopeKey, ExamSessionStatus status);

    boolean existsByTest_IdAndStatus(String testId, ExamSessionStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from ExamSession s where s.id = :id and s.user.id = :userId")
    Optional<ExamSession> findOwnedForUpdate(@Param("id") String id, @Param("userId") String userId);

    @Modifying
    @Transactional
    @Query("update ExamSession s set s.status = :expired, s.answersJson = '{}', s.targetQuestionIds = '[]' "
            + "where s.status = :active and s.expiresAt <= :now")
    int expireAndClearDrafts(@Param("active") ExamSessionStatus active,
                             @Param("expired") ExamSessionStatus expired,
                             @Param("now") java.time.LocalDateTime now);
}
