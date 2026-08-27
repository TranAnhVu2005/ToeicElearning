package com.ctu_cit_nienLuanNganh.toeicLearning.api.user.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.model.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.user.dto.UserResponeDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.user.request.UserChangePasswordRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.user.request.UserUpdateProfileRequest;
import org.springframework.http.ResponseEntity;

public interface UserService {
    UserResponeDTO viewProfile(User u);
    UserResponeDTO updateProfile(User u, UserUpdateProfileRequest request);
    void changePassword(User u, UserChangePasswordRequest request);
}
