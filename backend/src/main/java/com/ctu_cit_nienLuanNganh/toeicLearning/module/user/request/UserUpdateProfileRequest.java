package com.ctu_cit_nienLuanNganh.toeicLearning.module.user.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class UserUpdateProfileRequest {
    private String userName;

    @Email(message = "Email not valid!")
    private String userEmail;

    @Pattern(regexp = "^0\\d{9}$", message = "Number phone must begin with 0 and have 10 characters")
    private String userNumberphone;

    private String userAvatar;

    private MultipartFile file;
}
