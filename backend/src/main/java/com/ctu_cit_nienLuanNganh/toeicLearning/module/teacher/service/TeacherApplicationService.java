package com.ctu_cit_nienLuanNganh.toeicLearning.module.teacher.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TeacherApplicationStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Notification;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.PaymentTransaction;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Role;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.TeacherApplication;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.payment.dto.CheckoutResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.payment.service.VnpayGatewayService;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.service.AuditEventService;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.teacher.dto.TeacherApplicationResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.teacher.request.TeacherApplicationRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.NotificationRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.PaymentTransactionRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.RoleRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.TeacherApplicationRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TeacherApplicationService {
    private static final String PRODUCT_TYPE = "TEACHER_APPLICATION";
    private static final int CHECKOUT_MINUTES = 15;
    private static final ZoneId REPORTING_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final TeacherApplicationRepository applicationRepository;
    private final PaymentTransactionRepository paymentRepository;
    private final NotificationRepository notificationRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final VnpayGatewayService vnpayGatewayService;
    private final AuditEventService auditEventService;

    @Transactional
    public CheckoutResponse apply(User user, TeacherApplicationRequest request, String remoteAddress) {
        User applicant = userRepository.findByIdWithRoleForUpdate(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        String roleName = applicant.getRole() == null ? "" : applicant.getRole().getRoleName();
        if (!"ROLE_USER".equals(roleName)) throw new AppException(ErrorCode.TEACHER_APPLICATION_CONFLICT);
        long fee = vnpayGatewayService.configuredTeacherFee();
        if (fee < 1 || fee > 99_999_999 || !vnpayGatewayService.isConfigured()) {
            throw new AppException(ErrorCode.PAYMENT_NOT_CONFIGURED);
        }

        TeacherApplication application = applicationRepository.findTopByUser_IdOrderByCreatedAtDesc(applicant.getId())
                .orElse(null);
        if (application != null && application.getStatus() == TeacherApplicationStatus.PENDING_REVIEW) {
            throw new AppException(ErrorCode.TEACHER_APPLICATION_CONFLICT);
        }
        if (application != null && application.getStatus() == TeacherApplicationStatus.APPROVED) {
            throw new AppException(ErrorCode.TEACHER_APPLICATION_CONFLICT);
        }

        if (application != null && application.getStatus() == TeacherApplicationStatus.PENDING_PAYMENT) {
            // A locally expired order can still deliver a valid, delayed IPN. Do not create another order
            // until every such transaction has a definitive provider result.
            if (paymentRepository.existsByTeacherApplication_IdAndStatus(application.getId(), "EXPIRED")) {
                throw new AppException(ErrorCode.PAYMENT_RECONCILIATION_REQUIRED);
            }
            Optional<PaymentTransaction> latest = paymentRepository
                    .findTopByTeacherApplication_IdOrderByPaymentDateDesc(application.getId());
            if (latest.isPresent() && "PENDING".equals(latest.get().getStatus())) {
                PaymentTransaction pending = latest.get();
                LocalDateTime expiresAt = pending.getPaymentDate().plusMinutes(CHECKOUT_MINUTES);
                if (LocalDateTime.now(REPORTING_ZONE).isBefore(expiresAt)) {
                    return checkoutResponse(application, pending, remoteAddress);
                }
                throw new AppException(ErrorCode.PAYMENT_RECONCILIATION_REQUIRED);
            }
            if (request.getStatement() != null && !request.getStatement().isBlank()) {
                application.setStatement(request.getStatement().trim());
            }
        } else {
            application = applicationRepository.save(TeacherApplication.builder()
                    .user(applicant)
                    .statement(normalizeStatement(request.getStatement()))
                    .status(TeacherApplicationStatus.PENDING_PAYMENT)
                    .build());
        }

        PaymentTransaction payment = PaymentTransaction.builder()
                .user(applicant)
                .amount(BigDecimal.valueOf(fee))
                .vnpTxnRef(UUID.randomUUID().toString().replace("-", ""))
                .productType(PRODUCT_TYPE)
                .teacherApplication(application)
                .status("PENDING")
                .build();
        payment = paymentRepository.saveAndFlush(payment);
        return checkoutResponse(application, payment, remoteAddress);
    }

    @Transactional
    public Optional<TeacherApplicationResponse> getMine(User user) {
        return applicationRepository.findTopByUser_IdOrderByCreatedAtDesc(user.getId())
                .map(this::toResponse);
    }

    @Transactional
    public Page<TeacherApplicationResponse> list(TeacherApplicationStatus status, int page, int size) {
        if (page < 1 || size < 1 || size > 100) throw new AppException(ErrorCode.VALIDATION_ERROR);
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<TeacherApplication> applications = status == null
                ? applicationRepository.findAllByOrderByCreatedAtDesc(pageable)
                : applicationRepository.findByStatus(status, pageable);
        return applications.map(this::toResponse);
    }

    @Transactional
    public TeacherApplicationResponse review(String applicationId, User admin, boolean approve, String reason) {
        TeacherApplication application = applicationRepository.findForUpdate(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        if (application.getStatus() != TeacherApplicationStatus.PENDING_REVIEW) {
            throw new AppException(ErrorCode.TEACHER_APPLICATION_CONFLICT);
        }
        PaymentTransaction payment = paymentRepository
                .findTopByTeacherApplication_IdOrderByPaymentDateDesc(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.TEACHER_APPLICATION_CONFLICT));
        if (!"SUCCESS".equals(payment.getStatus()) || !PRODUCT_TYPE.equals(payment.getProductType())) {
            throw new AppException(ErrorCode.TEACHER_APPLICATION_CONFLICT);
        }
        if (approve) {
            if (Boolean.TRUE.equals(application.getUser().getIsLocked())) {
                throw new AppException(ErrorCode.USER_ACCOUNT_LOCKED);
            }
            Role teacherRole = roleRepository.findByRoleName("ROLE_TEACHER")
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
            application.getUser().setRole(teacherRole);
            userRepository.save(application.getUser());
            application.setStatus(TeacherApplicationStatus.APPROVED);
        } else {
            if (reason == null || reason.isBlank()) throw new AppException(ErrorCode.VALIDATION_ERROR);
            application.setStatus(TeacherApplicationStatus.REJECTED);
            application.setReviewReason(reason.trim());
        }
        application.setReviewedBy(admin);
        application.setReviewedAt(LocalDateTime.now(REPORTING_ZONE));
        applicationRepository.save(application);
        auditEventService.record(admin, approve ? "TEACHER_APPLICATION_APPROVED" : "TEACHER_APPLICATION_REJECTED",
                "TEACHER_APPLICATION", application.getId(), "status=PENDING_REVIEW->" + application.getStatus());
        notificationRepository.save(Notification.builder()
                .user(application.getUser())
                .title(approve ? "Đơn đăng ký giáo viên đã được duyệt" : "Đơn đăng ký giáo viên chưa được duyệt")
                .content(approve ? "Tài khoản của bạn đã được cấp quyền giáo viên."
                        : "Lý do: " + application.getReviewReason())
                .type("TEACHER_APPLICATION")
                .link("/teacher/application")
                .isRead(false)
                .build());
        return toResponse(application);
    }

    private CheckoutResponse checkoutResponse(TeacherApplication application, PaymentTransaction payment,
                                               String remoteAddress) {
        VnpayGatewayService.CheckoutLink checkout = vnpayGatewayService.createCheckout(payment, remoteAddress);
        return CheckoutResponse.builder()
                .applicationId(application.getId())
                .transactionReference(payment.getVnpTxnRef())
                .checkoutUrl(checkout.url())
                .paymentStatus(payment.getStatus())
                .amount(payment.getAmount())
                .expiresAt(checkout.expiresAt())
                .build();
    }

    private TeacherApplicationResponse toResponse(TeacherApplication application) {
        PaymentTransaction payment = paymentRepository
                .findTopByTeacherApplication_IdOrderByPaymentDateDesc(application.getId()).orElse(null);
        User user = application.getUser();
        return TeacherApplicationResponse.builder()
                .id(application.getId())
                .userId(user.getId())
                .userName(user.getUserName())
                .userEmail(user.getUserEmail())
                .statement(application.getStatement())
                .status(application.getStatus())
                .paymentStatus(payment == null ? null : payment.getStatus())
                .transactionReference(payment == null ? null : payment.getVnpTxnRef())
                .amount(payment == null ? null : payment.getAmount())
                .createdAt(application.getCreatedAt())
                .reviewedAt(application.getReviewedAt())
                .reviewerName(application.getReviewedBy() == null ? null : application.getReviewedBy().getUserName())
                .reviewReason(application.getReviewReason())
                .build();
    }

    private String normalizeStatement(String statement) {
        return statement == null || statement.isBlank() ? null : statement.trim();
    }
}
