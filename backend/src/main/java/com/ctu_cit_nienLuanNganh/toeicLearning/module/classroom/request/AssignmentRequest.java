package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.request;

import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.LatePolicy;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AssignmentRequest {
    @NotBlank
    @Size(max = 255)
    private String title;

    @Size(max = 5000)
    private String instructions;

    @Size(max = 64)
    private String testId;

    @Size(max = 64)
    private String materialId;

    @NotNull
    @Future
    private LocalDateTime deadline;

    @NotNull
    private LatePolicy latePolicy;
}
