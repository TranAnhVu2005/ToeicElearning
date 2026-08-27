package com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;

@Getter
@Setter
public class RegisterRequest {
    @NotBlank(message = "User name can't empty")
    private String userName;

    @NotBlank(message = "User email can't empty")
    @Email(message = "Email not valid!")
    private String userEmail;

    @NotBlank(message = "User numberphone can't empty")
    @Pattern(regexp = "^0\\d{9}$", message = "Number phone must begin with 0 and have 10 characters")
    private String userNumberphone;

    private String userAvatar;

    @NotBlank(message = "User password can't empty")
    @Size(min = 6, max = 100, message = "Password must at least 6 characters")
    private String userPassword;
}
