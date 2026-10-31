package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class DictationResponseDTO {
    String testId;
    String titleTest;
    List<DictationContextResponseDTO> contextQuestions;
}
