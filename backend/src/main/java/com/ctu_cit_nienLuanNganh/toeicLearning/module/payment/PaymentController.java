package com.ctu_cit_nienLuanNganh.toeicLearning.module.payment;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.service.LoginRateLimitService;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.payment.dto.CheckoutResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.payment.dto.PaymentStatusResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.payment.dto.VipCheckoutRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.payment.service.PayosPaymentService;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.payment.service.VipPurchaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PayosPaymentService paymentService;
    private final VipPurchaseService vipPurchaseService;
    private final LoginRateLimitService rateLimitService;

    @PostMapping("/vip/checkout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CheckoutResponse>> checkoutVip(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody VipCheckoutRequest request,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        limit("vip-checkout", servletRequest, currentUser, 20, 10);
        return ResponseEntity.ok(ApiResponse.success(vipPurchaseService.checkout(
                currentUser, request, servletRequest.getRemoteAddr())));
    }

    @PostMapping({"/payos/webhook", "/webhook"})
    public ResponseEntity<PayosPaymentService.WebhookResult> payosWebhook(
            @RequestBody(required = false) Map<String, Object> payload,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        // Keep a deliberately high IP-only ceiling so ordinary provider retries are not dropped.
        limit("payos-webhook", servletRequest, null, 1000, 0);
        PayosPaymentService.WebhookResult result = paymentService.processWebhook(payload);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/payos/return")
    public ResponseEntity<Void> returnFromGateway(@RequestParam MultiValueMap<String, String> query) {
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, paymentService.returnRedirect(query))
                .build();
    }

    @GetMapping("/me/{transactionReference}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> myPayment(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String transactionReference) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getMyPayment(currentUser, transactionReference)));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<PaymentStatusResponse>>> myPayments(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.listMyPayments(currentUser, page, size)));
    }

    private void limit(String scope, jakarta.servlet.http.HttpServletRequest request,
                       User user, int ipLimit, int userLimit) {
        String userId = user == null ? null : user.getId();
        String ip = request == null ? null : request.getRemoteAddr();
        rateLimitService.checkAllowed(scope, ip, userId, ipLimit, userId == null ? 0 : userLimit);
        rateLimitService.recordAttempt(scope, ip, userId, ipLimit, userId == null ? 0 : userLimit);
    }
}
