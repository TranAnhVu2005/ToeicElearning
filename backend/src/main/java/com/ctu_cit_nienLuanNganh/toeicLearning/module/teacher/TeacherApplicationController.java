package com.ctu_cit_nienLuanNganh.toeicLearning.module.teacher;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.payment.dto.CheckoutResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.teacher.dto.TeacherApplicationResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.teacher.request.TeacherApplicationRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.teacher.service.TeacherApplicationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teacher-applications")
@RequiredArgsConstructor
public class TeacherApplicationController {
    private final TeacherApplicationService applicationService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CheckoutResponse>> apply(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody TeacherApplicationRequest request,
            HttpServletRequest servletRequest) {
        CheckoutResponse response = applicationService.apply(currentUser, request, servletRequest.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TeacherApplicationResponse>> getMine(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.getMine(currentUser).orElse(null)));
    }
}
