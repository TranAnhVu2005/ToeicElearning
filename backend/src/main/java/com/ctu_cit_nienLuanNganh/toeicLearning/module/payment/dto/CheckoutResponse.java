package com.ctu_cit_nienLuanNganh.toeicLearning.module.payment.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Value
@Builder
public class CheckoutResponse {
    String applicationId;
    String transactionReference;
    String checkoutUrl;
    String paymentStatus;
    BigDecimal amount;
    LocalDateTime expiresAt;
}
