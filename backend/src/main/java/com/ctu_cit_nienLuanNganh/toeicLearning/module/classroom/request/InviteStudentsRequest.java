package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class InviteStudentsRequest {
    @NotEmpty(message = "Vui lòng nhập ít nhất một địa chỉ Gmail")
    @Size(max = 100, message = "Tối đa 100 địa chỉ Gmail mỗi lần mời")
    private List<String> emails;

    @Size(max = 1000, message = "Lời nhắn tối đa 1000 ký tự")
    private String message;
}
