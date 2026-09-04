package com.ctu_cit_nienLuanNganh.toeicLearning.common.exception;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import lombok.Getter;

@Getter
public class AppException extends RuntimeException{
    private final ErrorCode errorCode;

    //Khi viết throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS) chẳng hạn, mình cái được cái error code của lỗi đó gồm code, message
    // và status
    public AppException(ErrorCode errorCode)
    {
        super(errorCode.getMessage()); //Lấy message ra truyền cho RuntimeException
        this.errorCode = errorCode;
    }
}
