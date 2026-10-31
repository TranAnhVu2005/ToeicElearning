package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;


@Getter
@Setter
@SuperBuilder
public class SubmitExamResponseDTO{
    private String testResultId;
    private String testId;
    private String testTitle;
    private String partId;
    private String partName;

    private Integer listeningScore;
    private Integer readingScore;
    private Integer totalScore;
    private String scoreType;

    private Integer correctCount;
    private Integer totalCount;
    private Integer totalTime;
    private LocalDateTime createdAt; //Trả ra màn hình bạn hoàn thành bài thi vào lúc nào chẳng hạn

    // Tiến độ học tập
    private Integer currentStreak;
    private Integer highestStreak;
}
