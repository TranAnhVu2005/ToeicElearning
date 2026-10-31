package com.ctu_cit_nienLuanNganh.toeicLearning.entity;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.base.BaseCreatedUpdatedEntity;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.LatePolicy;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Assignment extends BaseCreatedUpdatedEntity {
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "deadline", nullable = false)
    private LocalDateTime deadline;

    @Enumerated(EnumType.STRING)
    @Column(name = "late_policy", length = 32)
    private LatePolicy latePolicy;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private Classroom classroom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id")
    private Test test;

    @Column(name = "external_file_url")
    private String externalFileUrl;
}
