package com.ctu_cit_nienLuanNganh.toeicLearning.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "auth_login_attempt")
@Getter
@Setter
@NoArgsConstructor
public class LoginAttemptBucket {
    @Id
    @Column(name = "bucket_key", length = 64, nullable = false)
    private String bucketKey;

    @Column(name = "attempt_count", nullable = false)
    private Integer attemptCount;

    @Column(name = "window_started_at", nullable = false)
    private LocalDateTime windowStartedAt;
}
