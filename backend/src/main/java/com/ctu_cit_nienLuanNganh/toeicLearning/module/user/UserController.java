package com.ctu_cit_nienLuanNganh.toeicLearning.module.user;

import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.dto.UserResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.request.UserChangePasswordRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.request.UserUpdateProfileRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.service.UserService;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDTO>>  viewProfile(@AuthenticationPrincipal User currentUser)
    {
        UserResponseDTO response = userService.viewProfile(currentUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }


    @PatchMapping("/updateprofile")
    public ResponseEntity<ApiResponse<UserResponseDTO>> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @Validated @RequestBody UserUpdateProfileRequest request
    ) {
        UserResponseDTO response = userService.updateProfile(currentUser, request);
        //Trường hợp dùng put Nếu trả về 200 ok là không chuẩn restful, trả về 204 no content thì mới đúng chuẩn
        // Vì khi user đã nộp dữ liệu lên server thì user biết mình sửa cái gì

        //Dùng pathch trả về 200 ok là phù hợp restful
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/changepassword")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UserChangePasswordRequest request
    )
    {
        userService.changePassword(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công"));
    }
}
