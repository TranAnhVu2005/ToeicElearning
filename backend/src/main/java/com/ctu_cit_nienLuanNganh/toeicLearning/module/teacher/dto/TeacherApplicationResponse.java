package com.ctu_cit_nienLuanNganh.toeicLearning.module.teacher.dto;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TeacherApplicationStatus;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Value
@Builder
public class TeacherApplicationResponse {
    String id;
    String userId;
    String userName;
    String userEmail;
    String statement;
    TeacherApplicationStatus status;
    String paymentStatus;
    String transactionReference;
    BigDecimal amount;
    LocalDateTime createdAt;
    LocalDateTime reviewedAt;
    String reviewerName;
    String reviewReason;
}
