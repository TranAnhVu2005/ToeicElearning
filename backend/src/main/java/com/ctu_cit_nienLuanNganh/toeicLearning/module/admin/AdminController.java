package com.ctu_cit_nienLuanNganh.toeicLearning.module.admin;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.dto.AdminResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.request.LockUserRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService adminService;
    @PatchMapping("/changestatus")
    public ResponseEntity<ApiResponse<AdminResponseDTO>> changeStatusUser(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody LockUserRequest request)
    {
        AdminResponseDTO adRes = adminService.lockUser(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success(request.isLocked() ? "Khóa tài khoản thành công" : "Mở khóa tài khoản thành công"));
    }


}
