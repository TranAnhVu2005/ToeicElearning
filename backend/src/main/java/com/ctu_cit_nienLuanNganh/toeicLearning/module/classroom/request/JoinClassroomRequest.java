package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JoinClassroomRequest {
    @NotBlank
    @Pattern(regexp = "[A-Za-z0-9]{8}")
    private String classCode;
}
