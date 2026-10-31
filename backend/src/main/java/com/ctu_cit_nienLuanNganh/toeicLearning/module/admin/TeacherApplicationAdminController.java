package com.ctu_cit_nienLuanNganh.toeicLearning.module.admin;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TeacherApplicationStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.teacher.dto.TeacherApplicationResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.teacher.request.TeacherApplicationReviewRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.teacher.service.TeacherApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/teacher-applications")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class TeacherApplicationAdminController {
    private final TeacherApplicationService applicationService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TeacherApplicationResponse>>> list(
            @RequestParam(required = false) TeacherApplicationStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<TeacherApplicationResponse> result = applicationService.list(status, page, size);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(result)));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<TeacherApplicationResponse>> approve(
            @PathVariable String id,
            @AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.review(id, admin, true, null)));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<TeacherApplicationResponse>> reject(
            @PathVariable String id,
            @AuthenticationPrincipal User admin,
            @Valid @RequestBody TeacherApplicationReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.review(id, admin, false, request.getReason())));
    }
}
