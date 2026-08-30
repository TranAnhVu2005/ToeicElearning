package com.ctu_cit_nienLuanNganh.toeicLearning.api.auth;

import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.dto.AuthResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.request.LoginRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.request.RegisterRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.service.AuthService;
import com.ctu_cit_nienLuanNganh.toeicLearning.helper.base.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> register(@Valid @RequestBody RegisterRequest request)
    {
        AuthResponseDTO response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký tài khoản thành công", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(@Valid @RequestBody LoginRequest request)
    {
        AuthResponseDTO response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
    }
}
