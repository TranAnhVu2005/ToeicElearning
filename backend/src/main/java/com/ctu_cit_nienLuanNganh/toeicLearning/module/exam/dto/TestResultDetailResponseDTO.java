package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class TestResultDetailResponseDTO {
    private String testResultId;
    private String testId;
    private String testTitle;
    private String partId;
    private String partName;

    private Integer listeningScore;
    private Integer readingScore;
    private Integer totalScore;
    private Integer correctCount;
    private Integer totalCount;
    private Integer totalTime;
    private LocalDateTime createdAt;

    private List<QuestionReviewDTO> questions;
    @Getter
    @Setter
    @Builder
    public static class QuestionReviewDTO {
        private String questionId;
        private Integer questionNumber;
        private Integer partNumber;
        private String partName;

        // Ngữ cảnh (Context)
        private String contextQuestionId;
        private String audioUrl;
        private String imageUrl;
        private String paragraph;
        private String transcript;
        private String translation;

        // Nội dung câu hỏi & 4 đáp án
        private String questionContent;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;

        // Kết quả đối chiếu
        private Character correctAnswer; // Đáp án đúng hệ thống
        private Character selectedAnswer;// Đáp án thí sinh đã chọn
        private Boolean isCorrect;       // true/false
        private String explanation;      // Lời giải thích
    }
}
