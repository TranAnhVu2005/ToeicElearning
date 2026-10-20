package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class TestHistoryResponseDTO {
    private String id;
    private String testId;
    private String testTitleId;
    private String partId;
    private String partName;
    private String typePractice; // Full test hoặc Part 1; Part 1,2; ...
    private Integer listeningScore;
    private Integer readingScore;
    private Integer totalScore;

    private Integer correctCount;
    private Integer totalCount;
    private Integer totalTime;
    private String timeSpentFormatted; //Format thời gian lại, backend sử dụng giây rất khó với giao diện người dùng
    private LocalDateTime createdAt;
}
