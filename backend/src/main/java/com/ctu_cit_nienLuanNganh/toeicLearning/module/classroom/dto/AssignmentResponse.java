package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto;

import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.LatePolicy;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class AssignmentResponse {
    String id;
    String classroomId;
    String title;
    String instructions;
    String testId;
    String testTitle;
    LocalDateTime deadline;
    LatePolicy latePolicy;
    Boolean active;
    String myLatestResultId;
    String mySubmissionStatus;
    Boolean myLatestSubmissionLate;
    LocalDateTime myLatestSubmittedAt;
}
