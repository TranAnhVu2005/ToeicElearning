package com.ctu_cit_nienLuanNganh.toeicLearning.entity;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TeacherApplicationStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.base.BaseCreatedUpdatedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "teacher_application")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class TeacherApplication extends BaseCreatedUpdatedEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "statement", length = 1000)
    private String statement;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 24)
    private TeacherApplicationStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "review_reason", length = 500)
    private String reviewReason;
}
