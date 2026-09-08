package com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LockUserRequest {
    @NotBlank(message = "ID người dùng không được để trống")
    private String userId;


    // Dùng not null vì not blank chỉ dùng cho dữ liệu dạng String
    @NotNull(message = "Trạng thái khóa không được để trống")
    @JsonProperty("isLocked")
    private Boolean isLocked;
}
