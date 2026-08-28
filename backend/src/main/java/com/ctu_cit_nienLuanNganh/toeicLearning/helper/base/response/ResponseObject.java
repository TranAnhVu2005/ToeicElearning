package com.ctu_cit_nienLuanNganh.toeicLearning.helper.base.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResponseObject <T>{
    private String message;
    private T data;

    // 1. Hàm success
    public static <T> ResponseObject<T> success(String message, T data)
    {
        return new ResponseObject<>(message, data);
    }

    // 2. Hàm error có kèm theo data (dùng cho lỗi validate cần trả về chi tiết lỗi)
    public static <T> ResponseObject<T>  error(String message, T data)
    {
        return new ResponseObject<>(message, data);
    }

    // 3. Hàm error chỉ có message (dùng cho các lỗi như đổi mật khẩu, not found,...)
    public static <T> ResponseObject<T>  error(String message)
    {
        return new ResponseObject<>(message, null);
    }
}
