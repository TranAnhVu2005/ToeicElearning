package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TestPartRequest {
    private int partNumber;
    private List<ContextQuestionRequest> contextQuestions; // Các cụm câu hỏi trong phần này
}
