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
    PART_NOT_FOUND(1007, "Chọn part không đúng chuẩn hoặc không tồn tại part này trong format hiện tại của IIG", HttpStatus.BAD_REQUEST),


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
    PAYMENT_NOT_CONFIGURED(2011, "Thanh toán trực tuyến chưa được cấu hình", HttpStatus.SERVICE_UNAVAILABLE),
    TEACHER_APPLICATION_CONFLICT(2012, "Hồ sơ đăng ký giáo viên hiện không thể thực hiện thao tác này", HttpStatus.CONFLICT),
    PAYMENT_RECONCILIATION_REQUIRED(2013, "Giao dịch đã hết hạn nhưng chưa có kết quả xác nhận; cần đối soát trước khi tạo giao dịch mới", HttpStatus.CONFLICT),
    LOCAL_PASSWORD_NOT_SET(2014, "Tài khoản này chưa có mật khẩu đăng nhập cục bộ để thay đổi", HttpStatus.BAD_REQUEST),
    LOCAL_PASSWORD_ALREADY_SET(2015, "Tài khoản đã có mật khẩu cục bộ; hãy dùng chức năng đổi mật khẩu", HttpStatus.CONFLICT),
    AUTH_RATE_LIMITED(2016, "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.", HttpStatus.TOO_MANY_REQUESTS),



    // 3000 - 3999: Nghiệp vụ TOEIC (Làm bài, Câu hỏi, Đề thi)
    TEST_NOT_FOUND(3001, "Không tìm thấy bài thi yêu cầu", HttpStatus.NOT_FOUND),
    QUESTION_NOT_FOUND(3002, "Không tìm thấy câu hỏi yêu cầu", HttpStatus.NOT_FOUND),
    FILE_NOT_FOUND(3003, "Không tìm thấy file", HttpStatus.NOT_FOUND),
    FILE_UPLOAD_FAILED(3004, "Tải file lên hệ thống thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    TEST_RESULT_NOT_FOUND(3005, "Không tìm thấy kết quả làm bài thi", HttpStatus.NOT_FOUND),
    TEST_CONTENT_INVALID(3006, "Đề thi chưa đạt yêu cầu nội dung để xuất bản", HttpStatus.BAD_REQUEST),
    TEST_ACCESS_REQUIRED(3007, "Bạn chưa có quyền truy cập đề thi này", HttpStatus.FORBIDDEN),
    TEST_ALREADY_OWNED(3008, "Bạn đã có quyền truy cập đề thi này", HttpStatus.CONFLICT),
    CLASSROOM_STORAGE_QUOTA_EXCEEDED(3009, "Lớp đã đạt giới hạn dung lượng tài liệu.", HttpStatus.PAYLOAD_TOO_LARGE),


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
