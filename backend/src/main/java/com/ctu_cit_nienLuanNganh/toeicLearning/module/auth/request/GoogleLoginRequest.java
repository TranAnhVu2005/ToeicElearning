package com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoogleLoginRequest {
    @NotBlank(message = "ID Token của Google không được để trống")
    private String idToken;
}
