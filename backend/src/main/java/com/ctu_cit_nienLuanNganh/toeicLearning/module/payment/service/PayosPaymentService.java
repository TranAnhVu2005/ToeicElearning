package com.ctu_cit_nienLuanNganh.toeicLearning.module.payment.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TeacherApplicationStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.service.AuditEventService;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Notification;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.PaymentTransaction;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.TeacherApplication;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.TestEntitlement;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.notification.service.NotificationService;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.payment.dto.PaymentStatusResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.NotificationRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.PaymentTransactionRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.TestEntitlementRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;

import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayosPaymentService {
    private static final String TEACHER_APPLICATION = "TEACHER_APPLICATION";
    private static final ZoneId GATEWAY_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter PAYOS_DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final PayosGatewayService gatewayService;
    private final PaymentTransactionRepository paymentRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final TestEntitlementRepository entitlementRepository;
    private final AuditEventService auditEventService;

    @Transactional
    public WebhookResult processWebhook(Map<String, Object> payload) {
        if (payload == null || payload.isEmpty()) {
            return new WebhookResult(0, "Ok", null);
        }
        String signature = payload.get("signature") != null ? String.valueOf(payload.get("signature")) : null;
        @SuppressWarnings("unchecked")
        Map<String, Object> data = payload.get("data") instanceof Map<?, ?> map
                ? (Map<String, Object>) map
                : null;
        if (data == null) {
            return new WebhookResult(0, "Ok", null);
        }
        if (!gatewayService.verifyWebhookSignature(data, signature)) {
            log.warn("Rejected PayOS webhook due to invalid signature");
            return new WebhookResult(1, "Invalid signature", null);
        }

        Object rawOrderCode = data.get("orderCode");
        String txnRef = rawOrderCode != null ? String.valueOf(rawOrderCode).trim() : "";
        if (txnRef.isBlank()) {
            return new WebhookResult(0, "Ok", null);
        }

        PaymentTransaction payment = paymentRepository.findForUpdateByPayosOrderCode(txnRef).orElse(null);
        if (payment == null) {
            // PayOS Dashboard sends a test webhook with dummy orderCode (e.g., 123) when verifying the webhook URL.
            log.info("PayOS webhook verified for non-local orderCode={} (webhook verification ping)", txnRef);
            return new WebhookResult(0, "Webhook verified", null);
        }

        if ("SUCCESS".equals(payment.getStatus())) {
            return new WebhookResult(0, "Confirm Success", null);
        }

        long webhookAmount = data.get("amount") instanceof Number num ? num.longValue() : -1L;
        long expectedAmount = payment.getAmount() != null
                ? payment.getAmount().setScale(0, RoundingMode.HALF_UP).longValue()
                : -2L;
        if (webhookAmount != expectedAmount) {
            return new WebhookResult(1, "Invalid Amount", null);
        }

        String topCode = payload.get("code") != null ? String.valueOf(payload.get("code")).trim() : "00";
        String dataCode = data.get("code") != null ? String.valueOf(data.get("code")).trim() : topCode;
        String reference = data.get("reference") != null && !String.valueOf(data.get("reference")).isBlank()
                ? String.valueOf(data.get("reference")).trim()
                : (data.get("paymentLinkId") != null ? String.valueOf(data.get("paymentLinkId")).trim() : "PAYOS");
        String txDateTime = data.get("transactionDateTime") != null
                ? String.valueOf(data.get("transactionDateTime")).trim()
                : null;

        boolean successfulPayment = "00".equals(topCode) && "00".equals(dataCode);
        if (successfulPayment && !hasValidProductAssociation(payment)) {
            return new WebhookResult(1, "Invalid payment data", null);
        }

        payment.setPayosCode(truncate(dataCode, 16));
        payment.setPayosStatus(successfulPayment ? "PAID" : "FAILED");
        payment.setPayosReference(truncate(reference, 64));
        String previousStatus = payment.getStatus();
        if (successfulPayment) {
            payment.setStatus("SUCCESS");
            payment.setPaidAt(parsePaidAt(txDateTime));
            onSuccessfulPayment(payment);
        } else {
            payment.setStatus("FAILED");
        }
        paymentRepository.save(payment);
        auditEventService.record(null, "PAYMENT_STATUS_CHANGED", "PAYMENT_TRANSACTION", payment.getId(),
                "status=" + previousStatus + "->" + payment.getStatus());
        return new WebhookResult(0, "Confirm Success", null);
    }

    @Transactional
    public void syncPendingPaymentIfPossible(PaymentTransaction payment) {
        if (payment == null || "SUCCESS".equals(payment.getStatus())) {
            return;
        }
        String status = payment.getStatus();
        if (!"PENDING".equals(status) && !"EXPIRED".equals(status)) {
            return;
        }
        PayosGatewayService.PayosLinkStatus remote = gatewayService.fetchPaymentLinkInfo(payment.getPayosOrderCode());
        if (remote == null || remote.status() == null) {
            return;
        }
        long expectedAmount = payment.getAmount() != null
                ? payment.getAmount().setScale(0, RoundingMode.HALF_UP).longValue()
                : 0L;
        String previousStatus = payment.getStatus();
        if ("PAID".equalsIgnoreCase(remote.status())
                && remote.amount() == expectedAmount
                && hasValidProductAssociation(payment)) {
            payment.setStatus("SUCCESS");
            payment.setPayosCode("00");
            payment.setPayosStatus("PAID");
            if (remote.reference() != null && !remote.reference().isBlank()) {
                payment.setPayosReference(truncate(remote.reference(), 64));
            }
            if (payment.getPaidAt() == null) {
                payment.setPaidAt(LocalDateTime.now(GATEWAY_ZONE));
            }
            onSuccessfulPayment(payment);
            paymentRepository.save(payment);
            auditEventService.record(null, "PAYMENT_STATUS_CHANGED", "PAYMENT_TRANSACTION", payment.getId(),
                    "status=" + previousStatus + "->SUCCESS");
        } else if ("CANCELLED".equalsIgnoreCase(remote.status())) {
            payment.setStatus("CANCELLED");
            payment.setPayosStatus("CANCELLED");
            paymentRepository.save(payment);
        } else if ("EXPIRED".equalsIgnoreCase(remote.status())) {
            payment.setStatus("EXPIRED");
            payment.setPayosStatus("EXPIRED");
            paymentRepository.save(payment);
        }
    }

    private boolean hasValidProductAssociation(PaymentTransaction payment) {
        if (payment.getUser() == null) return false;
        if (TEACHER_APPLICATION.equals(payment.getProductType())) {
            TeacherApplication application = payment.getTeacherApplication();
            return application != null && payment.getTest() == null
                    && application.getUser() != null
                    && payment.getUser().getId().equals(application.getUser().getId());
        }
        if ("TEST_VIP".equals(payment.getProductType())) {
            return payment.getTest() != null && payment.getTeacherApplication() == null;
        }
        return false;
    }

    @Transactional
    public PaymentStatusResponse getMyPayment(User user, String transactionReference) {
        PaymentTransaction payment = paymentRepository.findByPayosOrderCodeAndUser_Id(transactionReference, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        syncPendingPaymentIfPossible(payment);
        return PaymentStatusResponse.builder()
                .transactionReference(payment.getPayosOrderCode())
                .status(payment.getStatus())
                .productType(payment.getProductType())
                .productName(payment.getProductNameSnapshot())
                .testId(payment.getTest() == null ? null : payment.getTest().getId())
                .amount(payment.getAmount())
                .createdAt(payment.getPaymentDate())
                .paidAt(payment.getPaidAt())
                .build();
    }

    @Transactional
    public PageResponse<PaymentStatusResponse> listMyPayments(User user, int page, int size) {
        if (page < 1 || size < 1 || size > 50) throw new AppException(ErrorCode.VALIDATION_ERROR);
        Page<PaymentTransaction> payments = paymentRepository.findByUser_IdOrderByPaymentDateDesc(
                user.getId(), PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "paymentDate")));
        return PageResponse.of(payments.map(payment -> PaymentStatusResponse.builder()
                .transactionReference(payment.getPayosOrderCode())
                .status(payment.getStatus())
                .productType(payment.getProductType())
                .productName(payment.getProductNameSnapshot())
                .testId(payment.getTest() == null ? null : payment.getTest().getId())
                .amount(payment.getAmount())
                .createdAt(payment.getPaymentDate())
                .paidAt(payment.getPaidAt())
                .build()));
    }

    public String returnRedirect(MultiValueMap<String, String> query) {
        return gatewayService.redirectAfterReturn(query);
    }

    private void onSuccessfulPayment(PaymentTransaction payment) {
        if (TEACHER_APPLICATION.equals(payment.getProductType()) && payment.getTeacherApplication() != null) {
            TeacherApplication application = payment.getTeacherApplication();
            if (application.getStatus() != TeacherApplicationStatus.PENDING_PAYMENT) return;
            application.setStatus(TeacherApplicationStatus.PENDING_REVIEW);
            notificationRepository.save(Notification.builder()
                    .user(application.getUser())
                    .title("Đã nhận thanh toán đăng ký giáo viên")
                    .content("Thanh toán đã được PayOS xác nhận. Hồ sơ của bạn đang chờ quản trị viên duyệt.")
                    .type("TEACHER_APPLICATION_PAYMENT")
                    .link("/teacher/application")
                    .isRead(false)
                    .build());
            notificationService.notifyAllAdmins(
                    "Hồ sơ đăng ký giáo viên mới chờ duyệt",
                    "Người dùng " + application.getUser().getUserName() + " (" + application.getUser().getUserEmail()
                            + ") đã hoàn tất thanh toán phí đăng ký giáo viên qua PayOS và đang chờ phê duyệt.",
                    "TEACHER_APPLICATION_SUBMITTED",
                    "/admin/teacher-applications"
            );
            return;
        }
        if ("TEST_VIP".equals(payment.getProductType()) && payment.getTest() != null
                && !entitlementRepository.existsByUser_IdAndTest_Id(payment.getUser().getId(), payment.getTest().getId())) {
            TestEntitlement entitlement = entitlementRepository.save(TestEntitlement.builder()
                    .user(payment.getUser())
                    .test(payment.getTest())
                    .paymentTransaction(payment)
                    .source("PAYMENT")
                    .build());
            auditEventService.record(null, "TEST_ENTITLEMENT_GRANTED", "TEST_ENTITLEMENT", entitlement.getId(),
                    "source=PAYMENT; testId=" + payment.getTest().getId());
            notificationRepository.save(Notification.builder()
                    .user(payment.getUser())
                    .title("Đã mở khóa đề VIP")
                    .content("Bạn đã mua thành công đề " + payment.getProductNameSnapshot() + " qua PayOS. Quyền truy cập không hết hạn.")
                    .type("TEST_VIP_PURCHASE")
                    .link("/courses/" + payment.getTest().getId())
                    .isRead(false)
                    .build());
        }
    }

    private LocalDateTime parsePaidAt(String value) {
        if (value == null || value.isBlank()) {
            return LocalDateTime.now(GATEWAY_ZONE);
        }
        try {
            return LocalDateTime.parse(value.trim(), PAYOS_DATE);
        } catch (Exception exception) {
            return LocalDateTime.now(GATEWAY_ZONE);
        }
    }

    private String truncate(String value, int maxLength) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.length() > maxLength ? trimmed.substring(0, maxLength) : trimmed;
    }

    public record WebhookResult(int error, String message, Object data) {
        public boolean getSuccess() {
            return error == 0;
        }
    }
}
