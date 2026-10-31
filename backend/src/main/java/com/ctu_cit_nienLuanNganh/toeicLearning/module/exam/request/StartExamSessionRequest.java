package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class StartExamSessionRequest {
    @NotBlank
    @Size(max = 36)
    private String testId;

    @Size(max = 36)
    private String assignmentId;

    @Size(max = 36)
    private String sourceResultId;

    @Size(max = 7)
    private List<Integer> partNumbers;

    @Size(max = 200)
    private List<@NotBlank String> questionIds;

    private boolean restartActive;
}
