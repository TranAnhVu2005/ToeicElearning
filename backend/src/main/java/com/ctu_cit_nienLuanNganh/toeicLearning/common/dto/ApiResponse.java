package com.ctu_cit_nienLuanNganh.toeicLearning.common.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // Mấy trường null sẽ không có trong api
public class ApiResponse<T> {
    @Builder.Default
    private int code = 1000;

    private String message;
    private T data;

    @Builder.Default
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp = LocalDateTime.now();

    // 1. success + message + data
    // Message tự gửi
    public static <T> ApiResponse<T> success(String message, T data){
        return ApiResponse.<T>builder()
                .code(1000)
                .message(message)
                .data(data)
                .build();
    }

    // 2. success + message + data
    // Message cơ bản là "Thao tác thành công"
    public static <T> ApiResponse<T> success(T data){
        return ApiResponse.<T>builder()
                .code(1000)
                .message("Thao tác thành công")
                .data(data)
                .build();
    }

    // 3. Success chỉ có message (dùng khi xóa hoặc thao tác không cần trả về body)
    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .code(1000)
                .message(message)
                .build();
    }
    // 4. Error response theo ErrorCode
    public static <T> ApiResponse<T> error(int code, String message) {
        return ApiResponse.<T>builder()
                .code(code)
                .message(message)
                .build();
    }
    // 5. Error response có kèm data chi tiết (dùng cho validation errors)
    public static <T> ApiResponse<T> error(int code, String message, T errors) {
        return ApiResponse.<T>builder()
                .code(code)
                .message(message)
                .data(errors)
                .build();
    }


}
