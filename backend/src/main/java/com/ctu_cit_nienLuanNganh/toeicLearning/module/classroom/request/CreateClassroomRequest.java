package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateClassroomRequest {
    @NotBlank
    @Size(max = 120)
    private String className;

    @Size(max = 2000)
    private String description;
}
