package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomizeClassroomRequest {
    @Size(max = 32)
    private String themeColor;

    @Size(max = 1000)
    private String bannerUrl;
}
