package com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.PaymentTransaction;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.dto.PaymentTransactionResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.PaymentTransactionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PaymentAdminService {
    private static final Set<String> ALLOWED_STATUSES = Set.of("PENDING", "SUCCESS", "FAILED", "CANCELLED", "EXPIRED");
    private static final Set<String> ALLOWED_PRODUCT_TYPES = Set.of("TEACHER_APPLICATION", "TEST_VIP");
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("paymentDate", "amount", "status");
    private final PaymentTransactionRepository transactionRepository;

    @Transactional
    public PageResponse<PaymentTransactionResponseDTO> search(String status, LocalDateTime fromDate,
                                                               LocalDateTime toDate, String keyword,
                                                               String productType,
                                                               int page, int size, String sortBy, String direction) {
        String normalizedStatus = status == null || status.isBlank() ? null : status.trim().toUpperCase(Locale.ROOT);
        if (normalizedStatus != null && !ALLOWED_STATUSES.contains(normalizedStatus)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        String normalizedProductType = productType == null || productType.isBlank()
                ? null : productType.trim().toUpperCase(Locale.ROOT);
        if (normalizedProductType != null && !ALLOWED_PRODUCT_TYPES.contains(normalizedProductType)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        if (page < 1 || size < 1 || size > 100) throw new AppException(ErrorCode.VALIDATION_ERROR);
        if (keyword != null && keyword.length() > 120) throw new AppException(ErrorCode.VALIDATION_ERROR);
        String normalizedSort = sortBy == null || sortBy.isBlank() ? "paymentDate" : sortBy.trim();
        if (!ALLOWED_SORT_FIELDS.contains(normalizedSort)) throw new AppException(ErrorCode.VALIDATION_ERROR);
        String normalizedDirection = direction == null || direction.isBlank() ? "DESC" : direction.toUpperCase(Locale.ROOT);
        if (!Set.of("ASC", "DESC").contains(normalizedDirection)) throw new AppException(ErrorCode.VALIDATION_ERROR);
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(
                "ASC".equals(normalizedDirection) ? Sort.Direction.ASC : Sort.Direction.DESC, normalizedSort));
        Page<PaymentTransaction> resultPage = transactionRepository.searchForAdmin(
                normalizedStatus, fromDate, toDate, keyword == null ? null : keyword.trim(),
                normalizedProductType, pageable);
        return PageResponse.of(resultPage.map(this::toResponse));
    }

    @Transactional
    public PaymentTransactionResponseDTO getDetails(String paymentId) {
        PaymentTransaction payment = transactionRepository.findById(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        return toResponse(payment);
    }

    private PaymentTransactionResponseDTO toResponse(PaymentTransaction transaction) {
        return PaymentTransactionResponseDTO.builder()
                .id(transaction.getId())
                .payerId(transaction.getUser().getId())
                .payerName(transaction.getUser().getUserName())
                .payerEmail(transaction.getUser().getUserEmail())
                .productType(transaction.getProductType())
                .productName(transaction.getProductNameSnapshot())
                .amount(transaction.getAmount())
                .currency("VND")
                .transactionReference(transaction.getVnpTxnRef())
                .providerTransactionNumber(transaction.getVnpTransactionNo())
                .providerResponseCode(transaction.getVnpResponseCode())
                .providerTransactionStatus(transaction.getVnpTransactionStatus())
                .status(transaction.getStatus())
                .paymentDate(transaction.getPaymentDate())
                .paidAt(transaction.getPaidAt())
                .build();
    }
}
