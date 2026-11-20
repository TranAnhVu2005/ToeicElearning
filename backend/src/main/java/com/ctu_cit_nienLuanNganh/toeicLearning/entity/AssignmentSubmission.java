package com.ctu_cit_nienLuanNganh.toeicLearning.entity;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.base.BaseCreatedUpdatedEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "assignment_submission")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AssignmentSubmission extends BaseCreatedUpdatedEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "file_url", nullable = false, length = 1000)
    private String fileUrl;

    @Column(name = "cloudinary_public_id", length = 512)
    private String cloudinaryPublicId;

    @Column(name = "file_format", length = 20)
    private String fileFormat;

    @Column(name = "original_file_name", length = 180)
    private String originalFileName;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Column(name = "student_note", columnDefinition = "TEXT")
    private String studentNote;

    @Column(name = "deadline_snapshot")
    private LocalDateTime deadlineSnapshot;

    @Builder.Default
    @Column(name = "is_late", nullable = false)
    private Boolean late = false;

    @Column(name = "score")
    private Integer score;

    @Column(name = "teacher_comment", columnDefinition = "TEXT")
    private String teacherComment;
}
