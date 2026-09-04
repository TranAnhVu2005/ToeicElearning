package com.ctu_cit_nienLuanNganh.toeicLearning.module.user.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.dto.UserResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.request.UserChangePasswordRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.request.UserUpdateProfileRequest;

public interface UserService {
    UserResponseDTO viewProfile(User u);
    UserResponseDTO updateProfile(User u, UserUpdateProfileRequest request);
    void changePassword(User u, UserChangePasswordRequest request);
}
