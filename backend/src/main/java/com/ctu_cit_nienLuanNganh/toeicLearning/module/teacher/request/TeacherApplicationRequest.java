package com.ctu_cit_nienLuanNganh.toeicLearning.module.teacher.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeacherApplicationRequest {
    @Size(max = 1000)
    private String statement;
}
