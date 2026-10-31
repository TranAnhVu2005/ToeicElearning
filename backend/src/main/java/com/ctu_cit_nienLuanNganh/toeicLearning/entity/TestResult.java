package com.ctu_cit_nienLuanNganh.toeicLearning.entity;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.base.BaseCreatedEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_result", indexes = @Index(name = "idx_test_result_created_at", columnList = "created_at"),
        uniqueConstraints = @UniqueConstraint(name = "uk_test_result_user_submission", columnNames = {"user_id", "submission_key"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class TestResult extends BaseCreatedEntity { // Dùng BaseCreatedEntity vì bảng này chỉ có created_at, không có updated_at trong SQL
    @Column(name = "submission_key", length = 36)
    private String submissionKey;

    @Column(name = "listening_score")
    private Integer listeningScore;

    @Column(name = "reading_score")
    private Integer readingScore;

    @Column(name = "total_score")
    private Integer totalScore;

    @Column(name = "score_type", length = 32)
    private String scoreType;

    @Column(name = "correct_count")
    private Integer correctCount;

    @Column(name = "total_count", nullable = false)
    private Integer totalCount;

    @Column(name = "total_time", nullable = false)
    private Integer totalTime;

    @Column(name = "teacher_comment", columnDefinition = "TEXT")
    private String teacherComment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;

    @Column(name = "assignment_deadline_snapshot")
    private LocalDateTime assignmentDeadlineSnapshot;

    @Column(name = "assignment_late")
    private Boolean assignmentLate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_result_id")
    private TestResult sourceResult;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id")
    private Test test;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id")
    private Part part;

    @OneToMany(mappedBy = "testResult")
    private java.util.List<ExamSession> examSessions;
}
