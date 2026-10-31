package com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;

@Value
@Builder
public class DailyTestMetricsResponse {
    LocalDate date;
    long submittedAttempts;
    long startedAttempts;
}
