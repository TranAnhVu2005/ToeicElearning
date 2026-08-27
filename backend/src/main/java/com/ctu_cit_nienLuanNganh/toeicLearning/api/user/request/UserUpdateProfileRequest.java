package com.ctu_cit_nienLuanNganh.toeicLearning.api.user.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateProfileRequest {
    private String userName;

    @Email(message = "Email not valid!")
    private String userEmail;

    @Pattern(regexp = "^0\\d{9}$", message = "Number phone must begin with 0 and have 10 characters")
    private String userNumberphone;

    private String userAvatar;
}
