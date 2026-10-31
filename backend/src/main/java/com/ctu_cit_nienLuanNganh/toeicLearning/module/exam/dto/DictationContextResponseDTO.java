package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DictationContextResponseDTO {
    String id;
    String audioUrl;
    String imageUrl;
    String paragraph;
    String transcript;
    String translation;
    Integer orderIndex;
    Integer partNumber;
}
