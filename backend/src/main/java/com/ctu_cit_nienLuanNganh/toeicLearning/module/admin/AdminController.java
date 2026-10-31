package com.ctu_cit_nienLuanNganh.toeicLearning.module.admin;

import com.cloudinary.Api;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageParams;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.dto.AdminResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.request.LockUserRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.service.AdminService;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.service.PaymentAdminService;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.service.AdminMetricsService;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.service.AuditEventService;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.dto.AuditEventResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.dto.PaymentTransactionResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.dto.AdminOverviewMetricsResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.dto.DailyTestMetricsResponse;
import org.springframework.format.annotation.DateTimeFormat;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;


@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService adminService;
    private final PaymentAdminService paymentAdminService;
    private final AdminMetricsService adminMetricsService;
    private final AuditEventService auditEventService;

    @GetMapping("/users")
    //@ModelAttribute để hứng các tham số từ url truyền vào pageParams
    public ResponseEntity<ApiResponse<PageResponse<AdminResponseDTO>>> getAllUsers(@ModelAttribute PageParams pageParams)
    {
        PageResponse<AdminResponseDTO> response = adminService.getAllUsers(pageParams);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/changestatus")
    public ResponseEntity<ApiResponse<AdminResponseDTO>> changeStatusUser(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody LockUserRequest request)
    {
        AdminResponseDTO adRes = adminService.lockUser(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success(request.getIsLocked() ? "Khóa tài khoản thành công" : "Mở khóa tài khoản thành công", adRes));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<PageResponse<PaymentTransactionResponseDTO>>> searchPayments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String productType,
            @RequestParam(defaultValue = "1") int numberPage,
            @RequestParam(defaultValue = "10") int sizeOfPage,
            @RequestParam(defaultValue = "paymentDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {
        return ResponseEntity.ok(ApiResponse.success(paymentAdminService.search(status, fromDate, toDate,
                keyword, productType, numberPage, sizeOfPage, sortBy, direction)));
    }

    @GetMapping("/payments/{paymentId}")
    public ResponseEntity<ApiResponse<PaymentTransactionResponseDTO>> getPaymentDetails(
            @PathVariable String paymentId) {
        return ResponseEntity.ok(ApiResponse.success(paymentAdminService.getDetails(paymentId)));
    }

    @GetMapping("/metrics/overview")
    public ResponseEntity<ApiResponse<AdminOverviewMetricsResponse>> getMetricsOverview() {
        return ResponseEntity.ok(ApiResponse.success(adminMetricsService.overview()));
    }

    @GetMapping("/metrics/tests")
    public ResponseEntity<ApiResponse<List<DailyTestMetricsResponse>>> getDailyTestMetrics(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(adminMetricsService.dailyTests(from, to)));
    }

    @GetMapping("/audit-events")
    public ResponseEntity<ApiResponse<PageResponse<AuditEventResponse>>> getAuditEvents(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "25") int size) {
        return ResponseEntity.ok(ApiResponse.success(auditEventService.list(page, size)));
    }



}
