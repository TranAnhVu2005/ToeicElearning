package com.ctu_cit_nienLuanNganh.toeicLearning.module.payment.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TeacherApplicationStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Notification;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.PaymentTransaction;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.TeacherApplication;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.TestEntitlement;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.payment.dto.PaymentStatusResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.service.AuditEventService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.NotificationRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.PaymentTransactionRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.TestEntitlementRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Service
@RequiredArgsConstructor
public class VnpayPaymentService {
    private static final String TEACHER_APPLICATION = "TEACHER_APPLICATION";
    private static final ZoneId GATEWAY_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter GATEWAY_DATE = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final VnpayGatewayService gatewayService;
    private final PaymentTransactionRepository paymentRepository;
    private final NotificationRepository notificationRepository;
    private final TestEntitlementRepository entitlementRepository;
    private final AuditEventService auditEventService;

    @Transactional
    public IpNResult processIpn(MultiValueMap<String, String> query) {
        try {
            if (!gatewayService.verify(query)) return new IpNResult("97", "Invalid Checksum");
        } catch (RuntimeException exception) {
            return new IpNResult("97", "Invalid Checksum");
        }
        String txnRef = value(query, "vnp_TxnRef");
        String suppliedTmnCode = value(query, "vnp_TmnCode");
        if (!gatewayService.isExpectedMerchant(suppliedTmnCode)) return new IpNResult("97", "Invalid Merchant");
        if (txnRef.isBlank()) return new IpNResult("01", "Order not Found");

        PaymentTransaction payment = paymentRepository.findForUpdateByVnpTxnRef(txnRef).orElse(null);
        if (payment == null) return new IpNResult("01", "Order not Found");
        if (!"VND".equals(value(query, "vnp_CurrCode"))) {
            return new IpNResult("04", "Invalid Currency");
        }
        long amountMinor;
        try {
            amountMinor = Long.parseLong(value(query, "vnp_Amount"));
            long expectedMinor = payment.getAmount().multiply(BigDecimal.valueOf(100)).longValueExact();
            if (amountMinor != expectedMinor) return new IpNResult("04", "Invalid Amount");
        } catch (RuntimeException exception) {
            return new IpNResult("04", "Invalid Amount");
        }

        if ("SUCCESS".equals(payment.getStatus())) return new IpNResult("00", "Confirm Success");
        if (!"PENDING".equals(payment.getStatus())) return new IpNResult("02", "Order already confirmed");

        String responseCode = value(query, "vnp_ResponseCode");
        String transactionStatus = value(query, "vnp_TransactionStatus");
        String transactionNo = value(query, "vnp_TransactionNo");
        LocalDateTime paidAt = parsePaidAt(value(query, "vnp_PayDate"));
        if (responseCode.isBlank() || transactionStatus.isBlank() || transactionNo.isBlank() || paidAt == null) {
            return new IpNResult("99", "Invalid payment data");
        }

        boolean successfulPayment = "00".equals(responseCode) && "00".equals(transactionStatus);
        if (successfulPayment && !hasValidProductAssociation(payment)) {
            // Do not acknowledge a successful charge if its persisted product links cannot
            // produce the corresponding application transition or VIP entitlement. Keeping
            // the order pending lets operations reconcile inconsistent records safely.
            return new IpNResult("99", "Invalid payment data");
        }

        payment.setVnpResponseCode(responseCode);
        payment.setVnpTransactionStatus(transactionStatus);
        payment.setVnpTransactionNo(transactionNo);
        String previousStatus = payment.getStatus();
        if (successfulPayment) {
            payment.setStatus("SUCCESS");
            payment.setPaidAt(paidAt);
            onSuccessfulPayment(payment);
        } else {
            payment.setStatus("FAILED");
        }
        paymentRepository.save(payment);
        auditEventService.record(null, "PAYMENT_STATUS_CHANGED", "PAYMENT_TRANSACTION", payment.getId(),
                "status=" + previousStatus + "->" + payment.getStatus());
        return new IpNResult("00", "Confirm Success");
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
        PaymentTransaction payment = paymentRepository.findByVnpTxnRefAndUser_Id(transactionReference, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        return PaymentStatusResponse.builder()
                .transactionReference(payment.getVnpTxnRef())
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
                .transactionReference(payment.getVnpTxnRef())
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
                    .content("Thanh toán đã được VNPAY xác nhận. Hồ sơ của bạn đang chờ quản trị viên duyệt.")
                    .type("TEACHER_APPLICATION_PAYMENT")
                    .link("/teacher/application")
                    .isRead(false)
                    .build());
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
                    .content("Bạn đã mua thành công đề " + payment.getProductNameSnapshot() + ". Quyền truy cập không hết hạn.")
                    .type("TEST_VIP_PURCHASE")
                    .link("/courses/" + payment.getTest().getId())
                    .isRead(false)
                    .build());
        }
    }

    private LocalDateTime parsePaidAt(String value) {
        try {
            return LocalDateTime.parse(value, GATEWAY_DATE);
        } catch (DateTimeParseException exception) {
            return null;
        }
    }

    private String value(MultiValueMap<String, String> query, String key) {
        var values = query.get(key);
        return values == null || values.size() != 1 || values.get(0) == null ? "" : values.get(0);
    }

    public record IpNResult(
            @JsonProperty("RspCode") String responseCode,
            @JsonProperty("Message") String message) { }
}
