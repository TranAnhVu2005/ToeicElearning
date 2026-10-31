package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AssignmentSummaryResponse {
    int eligibleStudents;
    int submittedCount;
    int lateCount;
    int missingCount;
    int notSubmittedCount;
    int reviewedCount;
    Double averageScore;
    int averageScoreSubmissionCount;
}
