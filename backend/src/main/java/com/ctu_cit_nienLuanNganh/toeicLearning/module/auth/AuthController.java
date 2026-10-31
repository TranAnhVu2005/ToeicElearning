package com.ctu_cit_nienLuanNganh.toeicLearning.module.auth;

import com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.dto.AuthResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.request.GoogleLoginRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.request.LoginRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.request.RegisterRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.service.AuthService;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.service.LoginRateLimitService;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.service.AuditEventService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final LoginRateLimitService loginRateLimitService;
    private final AuditEventService auditEventService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest)
    {
        String clientIp = httpRequest.getRemoteAddr();
        loginRateLimitService.checkAllowed("register", clientIp, request.getUserEmail(), 10, 5);
        loginRateLimitService.recordAttempt("register", clientIp, request.getUserEmail(), 10, 5);
        AuthResponseDTO response = authService.register(request);
        auditEventService.recordActorId(response.getId(), "ACCOUNT_REGISTERED", "USER", response.getId(),
                "provider=LOCAL", "SUCCESS");
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký tài khoản thành công", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest)
    {
        String clientIp = httpRequest.getRemoteAddr();
        loginRateLimitService.checkAllowed(clientIp, request.getEmailOrPhone());
        try {
            AuthResponseDTO response = authService.login(request);
            auditEventService.recordAuthentication(response.getId(), true, false);
            return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
        } catch (AppException exception) {
            if (exception.getErrorCode() == ErrorCode.INVALID_CREDENTIALS) {
                loginRateLimitService.recordFailure(clientIp, request.getEmailOrPhone());
                auditEventService.recordAuthentication(null, false, false);
            }
            throw exception;
        }
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request, HttpServletRequest httpRequest){
        String clientIp = httpRequest.getRemoteAddr();
        loginRateLimitService.checkAllowed("google", clientIp, null, 30, 0);
        loginRateLimitService.recordAttempt("google", clientIp, null, 30, 0);
        try {
            AuthResponseDTO response = authService.loginWithGoogle(request.getIdToken());
            auditEventService.recordAuthentication(response.getId(), true, true);
            return ResponseEntity.ok(ApiResponse.success("Đăng nhập thông qua tài khoản Google thành công", response));
        } catch (AppException exception) {
            auditEventService.recordAuthentication(null, false, true);
            throw exception;
        }
    }
}
