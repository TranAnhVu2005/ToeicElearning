package com.ctu_cit_nienLuanNganh.toeicLearning.entity;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ExamSessionStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.base.BaseCreatedUpdatedEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "exam_session", indexes = {
        @Index(name = "idx_exam_session_user_status", columnList = "user_id,status"),
        @Index(name = "idx_exam_session_expires_at", columnList = "expires_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ExamSession extends BaseCreatedUpdatedEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "test_id", nullable = false)
    private Test test;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_result_id")
    private TestResult sourceResult;

    @Column(name = "scope_key", nullable = false, length = 64)
    private String scopeKey;

    @Column(name = "test_content_fingerprint", length = 64, nullable = false)
    private String testContentFingerprint;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "duration_limit_seconds")
    private Integer durationLimitSeconds;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ExamSessionStatus status;

    @Column(name = "target_question_ids", nullable = false, columnDefinition = "LONGTEXT")
    private String targetQuestionIds;

    @Column(name = "answers_json", nullable = false, columnDefinition = "LONGTEXT")
    private String answersJson;

    @Column(name = "last_saved_at", nullable = false)
    private LocalDateTime lastSavedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_result_id")
    private TestResult testResult;
}
