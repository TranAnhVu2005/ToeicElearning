package com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.dto;

import java.time.LocalDateTime;

public record AuditEventResponse(
        String id,
        LocalDateTime occurredAtUtc,
        String actorUserId,
        String action,
        String targetType,
        String targetId,
        String outcome,
        String details) {
}
