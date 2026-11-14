package com.ctu_cit_nienLuanNganh.toeicLearning.module.ai.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AiChatRequest {

    @NotBlank(message = "Nội dung câu hỏi không được để trống")
    private String message;

    private String resultId;

    private String questionId;

    private Integer questionNumber;

    private String pageContext;

    private List<HistoryMessage> history;

    @Getter
    @Setter
    public static class HistoryMessage {
        private String role;
        private String content;
    }
}
