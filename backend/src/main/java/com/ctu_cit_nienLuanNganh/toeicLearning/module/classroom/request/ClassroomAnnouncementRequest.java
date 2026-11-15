package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ClassroomAnnouncementRequest {
    @Size(max = 200)
    private String title;

    @NotBlank
    @Size(max = 3000)
    private String content;
}
