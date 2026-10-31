package com.ctu_cit_nienLuanNganh.toeicLearning.common.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.AuditEvent;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.dto.AuditEventResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.AuditEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditEventService {
    private final AuditEventRepository repository;

    public void record(User actor, String action, String targetType, String targetId, String details) {
        record(actor, action, targetType, targetId, details, "SUCCESS");
    }

    public void record(User actor, String action, String targetType, String targetId, String details, String outcome) {
        recordActorId(actor == null ? null : actor.getId(), action, targetType, targetId, details, outcome);
    }

    public void recordActorId(String actorUserId, String action, String targetType, String targetId,
                              String details, String outcome) {
        repository.save(AuditEvent.builder()
                .actorUserId(actorUserId)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .outcome(outcome)
                .details(details)
                .build());
    }

    public void recordAuthentication(String actorUserId, boolean successful, boolean googleLogin) {
        recordActorId(actorUserId, successful ? "LOGIN_SUCCEEDED" : "LOGIN_FAILED", "AUTHENTICATION",
                googleLogin ? "GOOGLE_LOGIN" : "LOCAL_LOGIN",
                "identifier=" + (googleLogin ? "google" : "email-or-phone"), successful ? "SUCCESS" : "DENIED");
    }

    public PageResponse<AuditEventResponse> list(int page, int size) {
        int safePage = Math.max(1, page);
        int safeSize = Math.max(1, Math.min(size, 100));
        var events = repository.findAllByOrderByOccurredAtUtcDesc(
                PageRequest.of(safePage - 1, safeSize, Sort.by(Sort.Direction.DESC, "occurredAtUtc")));
        return PageResponse.of(events.map(event -> new AuditEventResponse(
                event.getId(), event.getOccurredAtUtc(), event.getActorUserId(), event.getAction(),
                event.getTargetType(), event.getTargetId(), event.getOutcome(), event.getDetails())));
    }
}
