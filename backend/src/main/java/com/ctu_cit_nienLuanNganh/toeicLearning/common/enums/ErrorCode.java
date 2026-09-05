package com.ctu_cit_nienLuanNganh.toeicLearning.common.enums;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    // 1000 - 1999: Lỗi chung / Validation / Format
    INVALID_KEY(1001, "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    VALIDATION_ERROR(1002, "Dữ liệu gửi lên không hợp lệ", HttpStatus.BAD_REQUEST),
    RESOURCE_NOT_FOUND(1003, "Không tìm thấy tài nguyên yêu cầu", HttpStatus.NOT_FOUND),
    DATA_INTEGRITY_VIOLATION(1004, "Dữ liệu đã tồn tại trên hệ thống hoặc vi phạm ràng buộc dữ liệu", HttpStatus.CONFLICT),
    REQUEST_BODY_MALFORMED(1005, "Định dạng JSON gửi lên không hợp lệ", HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(1006, "Cấu hình sai, chưa có vai trò là user tôi thiểu trong database", HttpStatus.BAD_REQUEST),


    // 2000 - 2999: Lỗi Xác thực & Người dùng (Auth & User)
    UNAUTHENTICATED(2001, "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(2002, "Bạn không có quyền truy cập chức năng này", HttpStatus.FORBIDDEN),
    USER_NOT_EXISTED(2003, "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    EMAIL_ALREADY_EXISTS(2004, "Email này đã được sử dụng trên hệ thống", HttpStatus.BAD_REQUEST),
    PHONE_ALREADY_EXISTS(2005, "Số điện thoại này đã được sử dụng trên hệ thống", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS(2006, "Email/Số điện thoại hoặc mật khẩu không chính xác", HttpStatus.BAD_REQUEST),
    OLD_PASSWORD_INCORRECT(2007, "Mật khẩu cũ không chính xác",HttpStatus.BAD_REQUEST),
    NEW_PASSWORD_SAME_AS_OLD(2008, "Mật khẩu mới không được trùng với mật khẩu cũ", HttpStatus.BAD_REQUEST),
    USER_ACCOUNT_LOCKED(2009, "Tài khoản của bạn đã bị khóa, vui lòng liên hệ quản trị viên", HttpStatus.FORBIDDEN),
    CANNOT_LOCK_CURRENT_USER(2010, "Quản trị viên không thể tự khóa tài khoản của chính mình", HttpStatus.BAD_REQUEST),



    // 3000 - 3999: Nghiệp vụ TOEIC (Làm bài, Câu hỏi, Đề thi)
    TEST_NOT_FOUND(3001, "Không tìm thấy bài thi yêu cầu", HttpStatus.NOT_FOUND),
    QUESTION_NOT_FOUND(3002, "Không tìm thấy câu hỏi yêu cầu", HttpStatus.NOT_FOUND),


    // Đặt vào trong enum ErrorCode.java
    UNCATEGORIZED_EXCEPTION(9999, "Lỗi hệ thống không xác định", HttpStatus.INTERNAL_SERVER_ERROR);

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
    ErrorCode(int code, String message, HttpStatusCode statusCode)
    {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
