package com.ctu_cit_nienLuanNganh.toeicLearning.api.user;

import com.ctu_cit_nienLuanNganh.toeicLearning.api.user.dto.UserResponeDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.model.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.user.request.UserChangePasswordRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.user.request.UserUpdateProfileRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.user.service.UserService;
import com.ctu_cit_nienLuanNganh.toeicLearning.helper.base.response.ApiResponse;
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
    public ResponseEntity<ApiResponse<UserResponeDTO>>  viewProfile(@AuthenticationPrincipal User currentUser)
    {
        UserResponeDTO response = userService.viewProfile(currentUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }


    @PatchMapping("/updateprofile")
    public ResponseEntity<ApiResponse<UserResponeDTO>> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @Validated @RequestBody UserUpdateProfileRequest request
    ) {
        UserResponeDTO response = userService.updateProfile(currentUser, request);
        //Trường hợp dùng put Nếu trả về 200 ok là không chuẩn restful, trả về 204 no content thì mới đúng chuẩn
        // Vì khi user đã nộp dữ liệu lên server thì user biết mình sửa cái gì

        //Dùng pathch trả về 200 ok là phù hợp restful
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/changepassword")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal User currentUser,
            @RequestBody UserChangePasswordRequest request
    )
    {
        userService.changePassword(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công"));
    }
}
