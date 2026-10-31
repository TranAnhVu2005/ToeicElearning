package com.ctu_cit_nienLuanNganh.toeicLearning.module.user;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.service.CloudinaryService;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.dto.UserResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.request.UserChangePasswordRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.request.SetLocalPasswordRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.request.UserUpdateProfileRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.service.UserService;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.service.UserPresenceService;
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
    private final UserPresenceService userPresenceService;

    @PostMapping("/presence")
    public ResponseEntity<ApiResponse<Void>> heartbeat(@AuthenticationPrincipal User currentUser) {
        userPresenceService.heartbeat(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Đã ghi nhận hoạt động"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDTO>>  viewProfile(@AuthenticationPrincipal User currentUser)
    {
        UserResponseDTO response = userService.viewProfile(currentUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }


    @PatchMapping("/updateprofile")
    public ResponseEntity<ApiResponse<UserResponseDTO>> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @Validated @ModelAttribute UserUpdateProfileRequest request
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

    @PostMapping("/setpassword")
    public ResponseEntity<ApiResponse<Void>> setLocalPassword(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody SetLocalPasswordRequest request
    ) {
        userService.setLocalPassword(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Đã thiết lập mật khẩu. Vui lòng đăng nhập lại."));
    }
}
