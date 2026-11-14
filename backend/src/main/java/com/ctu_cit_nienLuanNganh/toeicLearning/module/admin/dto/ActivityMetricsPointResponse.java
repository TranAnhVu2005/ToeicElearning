package com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ActivityMetricsPointResponse {
    String period;
    long uniqueLoginUsers;
    long loginCount;
    long startedAttempts;
    long submittedAttempts;
}
