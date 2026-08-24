package com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.dto.AuthResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.request.LoginRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.request.RegisterRequest;

public interface AuthService {
    AuthResponseDTO register(RegisterRequest request);
    AuthResponseDTO login(LoginRequest request);
}
