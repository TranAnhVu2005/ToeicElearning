package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class AssignmentSubmissionResponse {
    String studentId;
    String studentName;
    String studentEmail;
    String status;
    Boolean late;
    String resultId;
    Integer score;
    Integer correctCount;
    Integer totalCount;
    LocalDateTime submittedAt;
    String teacherComment;
}
