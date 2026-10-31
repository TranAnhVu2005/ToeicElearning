package com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentTransactionResponseDTO {
    private String id;
    private String payerId;
    private String payerName;
    private String payerEmail;
    private String productType;
    private String productName;
    private BigDecimal amount;
    private String currency;
    private String transactionReference;
    private String providerTransactionNumber;
    private String providerResponseCode;
    private String providerTransactionStatus;
    private String status;
    private LocalDateTime paymentDate;
    private LocalDateTime paidAt;
}
