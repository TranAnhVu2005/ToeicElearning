package com.ctu_cit_nienLuanNganh.toeicLearning.exception;

import com.ctu_cit_nienLuanNganh.toeicLearning.exception.custom.BadRequestException;
import com.ctu_cit_nienLuanNganh.toeicLearning.exception.custom.ResourceNotFoundException;
import com.ctu_cit_nienLuanNganh.toeicLearning.helper.base.response.ResponseObject;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import tools.jackson.databind.exc.InvalidFormatException;
import org.springframework.security.access.AccessDeniedException;
import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
   // 1. Xử lý lỗi validate @Valid trong Request Body/ Model Attribute
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseObject<Map<String, String>>> handleValidationException(MethodArgumentNotValidException ex)
    {
        //Tạo một Map lưu key - value, trong đó key là trường bị lỗi, còn value là thông báo lỗi
        // VD: (email, trường này không được để trống)
        Map<String, String> errors = ex.getBindingResult()
                .getFieldErrors() // Lấy ra danh sách tất cả các trường lỗi
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : "Không hợp lệ",
                        (existing, replacement) -> existing // Có nhiều hơn 1 lỗi, giữ lại lỗi đầu tiên
                ));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseObject.error("Dữ liệu gửi lên không hợp lệ", errors));
    }

    // 2. Xử lý lỗi validate cho @RequestParam hoặc @PathVariable trên URL
    @ExceptionHandler(ConstraintViolationException.class)
    // Cú pháp của generic function, String thay cho T
    public  ResponseEntity<ResponseObject<String>> handleConstraintViolationException(ConstraintViolationException ex)
    {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseObject.error("Vi phạm ràng buộc dữ liệu", ex.getMessage()));
    }

    // 3. Xử lý lỗi không tìm thấy tài nguyên
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ResponseObject<Void>> handleResourceNotFoundException(ResourceNotFoundException ex)
    {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponseObject.error(ex.getMessage()));
    }

    // 4. Xử lý lỗi dữ liệu không hợp lệ do logic code quy định (Sai mật khẩu cũ, trùng mật khẩu mới)
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ResponseObject<Object>> handleBadRequestException(BadRequestException ex)
    {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ResponseObject.error(ex.getMessage(), ex.getData()));
    }

    // 5. Xử lý từ chối truy cập, user truy cập api của admin
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ResponseObject<Void>> handleAccessDeniedException(AccessDeniedException ex)
    {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ResponseObject.error(ex.getMessage()));
    }

    // 6. Xử lý lỗi cú pháp json từ client
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ResponseObject<Void>> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex)
    {
        String message = "Dữ liệu gửi lên không đúng định dạng";
        if(ex.getCause() instanceof InvalidFormatException ife)
        {
            String validValues = Arrays.toString(ife.getTargetType().getEnumConstants());
            message = "Trạng thái không hợp lệ! Chỉ chấp nhận các giá trị: " + validValues;
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ResponseObject.error(message));
    }

    // 7. Xử lý lỗi vi phạm ràng buộc db
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ResponseObject<Void>> handleDataIntergrityViolation(DataIntegrityViolationException ex)
    {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ResponseObject.error("Dữ liệu đã tồn tại trên hệ thống hoặc vi phạm ràng buộc"));
    }

    // 8. Bắt các lỗi còn lại
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseObject<Void>> handleAllException(Exception ex){
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ResponseObject.error("Đã có lỗi xảy ra từ phía hệ thống, vui lòng thử lại sau!"));
    }


}
