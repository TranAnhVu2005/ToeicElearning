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
    String materialId;
    String materialTitle;
    String materialFileName;
    Long materialSizeBytes;
    Boolean materialDownloadable;
    LocalDateTime deadline;
    LatePolicy latePolicy;
    Boolean active;
    LocalDateTime createdAt;
    String myLatestResultId;
    String myPdfSubmissionId;
    String myPdfSubmissionFileName;
    Long myPdfSubmissionSizeBytes;
    String myPdfSubmissionNote;
    String mySubmissionStatus;
    Boolean myLatestSubmissionLate;
    LocalDateTime myLatestSubmittedAt;
    Integer myLatestScore;
    Integer myCorrectCount;
    Integer myTotalCount;
    String myTeacherComment;
}
