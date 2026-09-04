package com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest{
    @NotBlank(message = "Email or phone number can't be empty")
    private String emailOrPhone;

    @NotBlank(message = "Password can't be empty")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String userPassword;
}
