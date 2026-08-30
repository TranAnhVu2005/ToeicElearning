package com.ctu_cit_nienLuanNganh.toeicLearning.api.user.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserChangePasswordRequest {
    @NotBlank(message = "Mật khẩu cũ không được để trống")
    private String oldUserPassword;

    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 6, message = "Mật khẩu mới phải có ít nhất 6 ký tự")
    private String newUserPassword;
}
