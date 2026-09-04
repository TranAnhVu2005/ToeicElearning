package com.ctu_cit_nienLuanNganh.toeicLearning.common.exception;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import tools.jackson.databind.exc.InvalidFormatException;
import org.springframework.security.access.AccessDeniedException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    // 0. Xử lý các lỗi định nghĩa trong lúc code (tùy theo nghiệp vụ, spring boot không biết)
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex)
    {
        ErrorCode errorCode = ex.getErrorCode();
        return ResponseEntity
                .status(errorCode.getStatusCode())
                .body(ApiResponse.error(errorCode.getCode(), errorCode.getMessage()));
    }



   // 1. Xử lý lỗi validate @Valid trong Request Body/ Model Attribute

    //Hết biết đường viết ngay chỗ này rồi, mai làm tiếp :))))
    // Map<String, String> là kiểu trả về của data trong response
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(MethodArgumentNotValidException ex)
    {
        //Tạo một Map lưu key - value, trong đó key là trường bị lỗi, còn value là thông báo lỗi
        // VD: (email, trường này không được để trống)
        Map<String, String> errors = new HashMap<>();
        for(FieldError fieldError: ex.getBindingResult().getFieldErrors())
        {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        ErrorCode errorCode = ErrorCode.VALIDATION_ERROR;
        return ResponseEntity
                .status(errorCode.getStatusCode())
                .body(ApiResponse.error(errorCode.getCode(), errorCode.getMessage(), errors));
    }

    // 2. Xử lý lỗi validate cho @RequestParam hoặc @PathVariable trên URL
    @ExceptionHandler(ConstraintViolationException.class)
    // Cú pháp của generic function, String thay cho T
    public  ResponseEntity<ApiResponse<Void>> handleConstraintViolationException(ConstraintViolationException ex)
    {
        ErrorCode errorCode = ErrorCode.VALIDATION_ERROR;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.error(errorCode.getCode(), errorCode.getMessage()));
    }

    // 3. Xử lý lỗi không tìm thấy tài nguyên
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<String>>handleResourceNotFoundException(NoResourceFoundException ex)
    {
        ErrorCode errorCode = ErrorCode.RESOURCE_NOT_FOUND;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.error(errorCode.getCode(), errorCode.getMessage() + " tại " + ex.getResourcePath()));
    }


    // 5. Xử lý từ chối truy cập, user truy cập api của admin
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException ex)
    {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.error(errorCode.getCode(), errorCode.getMessage()));
    }

    // 6. Xử lý lỗi cú pháp json từ client
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex)
    {
        ErrorCode errorCode = ErrorCode.REQUEST_BODY_MALFORMED;
        String message = errorCode.getMessage();
        if(ex.getCause() instanceof InvalidFormatException ife)
        {
            String validValues = Arrays.toString(ife.getTargetType().getEnumConstants());
            message = "Trạng thái không hợp lệ! Chỉ chấp nhận các giá trị: " + validValues;
        }
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.error(errorCode.getCode(),message));
    }

    // 7. Xử lý lỗi vi phạm ràng buộc db
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntergrityViolation(DataIntegrityViolationException ex)
    {
        ErrorCode errorCode = ErrorCode.DATA_INTEGRITY_VIOLATION;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.error(errorCode.getCode(), errorCode.getMessage()));
    }

    // 8. Bắt các lỗi còn lại
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleAllException(Exception ex){
        ErrorCode errorCode = ErrorCode.UNCATEGORIZED_EXCEPTION;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.error(errorCode.getCode(), errorCode.getMessage()));
    }


}
