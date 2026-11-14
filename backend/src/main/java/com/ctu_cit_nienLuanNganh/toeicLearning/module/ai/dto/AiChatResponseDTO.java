package com.ctu_cit_nienLuanNganh.toeicLearning.module.ai.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class AiChatResponseDTO {
    private String reply;
    private String contextMode;
    private Integer referencedQuestionNumber;
    private List<String> suggestedFollowUps;
    private String source;
}
