package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignmentFeedbackRequest {
    @Min(0)
    @Max(990)
    private Integer score;

    @NotBlank
    @Size(max = 5000)
    private String comment;
}
