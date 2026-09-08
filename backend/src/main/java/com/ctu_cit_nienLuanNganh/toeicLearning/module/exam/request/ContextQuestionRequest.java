package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ContextQuestionRequest {
    private String audioUrl;
    private String imageUrl;
    private String paragraph;
    private String transcript;
    private List<QuestionRequest> questions; // Danh sách câu hỏi thuộc cụm này
}
