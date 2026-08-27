package com.ctu_cit_nienLuanNganh.toeicLearning.api.user.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserChangePasswordRequest {
    private String oldUserPassword;
    private String newUserPassword;
}
