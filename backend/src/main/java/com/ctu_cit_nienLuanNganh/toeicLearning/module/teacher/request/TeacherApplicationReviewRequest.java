package com.ctu_cit_nienLuanNganh.toeicLearning.module.teacher.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeacherApplicationReviewRequest {
    @Size(max = 500)
    private String reason;
}
