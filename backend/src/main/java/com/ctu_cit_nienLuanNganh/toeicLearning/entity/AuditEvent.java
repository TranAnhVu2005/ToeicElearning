package com.ctu_cit_nienLuanNganh.toeicLearning.entity;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.base.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.PrePersist;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "audit_event", indexes = {
        @Index(name = "idx_audit_occurred_utc", columnList = "occurred_at_utc"),
        @Index(name = "idx_audit_target", columnList = "target_type,target_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AuditEvent extends BaseEntity {
    @Column(name = "occurred_at_utc", nullable = false, updatable = false)
    private LocalDateTime occurredAtUtc;

    @Column(name = "actor_user_id", length = 36)
    private String actorUserId;

    @Column(name = "action", nullable = false, length = 80)
    private String action;

    @Column(name = "target_type", nullable = false, length = 60)
    private String targetType;

    @Column(name = "target_id", nullable = false, length = 36)
    private String targetId;

    @Column(name = "outcome", nullable = false, length = 30)
    private String outcome;

    @Column(name = "details", length = 300)
    private String details;

    @PrePersist
    void setOccurrenceTimeIfMissing() {
        if (occurredAtUtc == null) occurredAtUtc = LocalDateTime.now(ZoneOffset.UTC);
    }
}
