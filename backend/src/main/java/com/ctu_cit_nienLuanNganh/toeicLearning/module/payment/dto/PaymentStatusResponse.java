package com.ctu_cit_nienLuanNganh.toeicLearning.module.payment.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Value
@Builder
public class PaymentStatusResponse {
    String transactionReference;
    String status;
    String productType;
    String productName;
    String testId;
    BigDecimal amount;
    LocalDateTime createdAt;
    LocalDateTime paidAt;
}
