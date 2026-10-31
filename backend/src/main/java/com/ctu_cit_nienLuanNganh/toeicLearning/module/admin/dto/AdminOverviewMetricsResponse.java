package com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Value
@Builder
public class AdminOverviewMetricsResponse {
    long activeUsers;
    int activeWindowMinutes;
    long submittedAttemptsToday;
    long startedAttemptsToday;
    LocalDate reportingDate;
    String timeZone;
    LocalDateTime generatedAt;
}
