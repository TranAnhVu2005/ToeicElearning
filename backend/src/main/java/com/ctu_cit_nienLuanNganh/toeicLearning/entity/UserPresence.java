package com.ctu_cit_nienLuanNganh.toeicLearning.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_presence", indexes = @Index(name = "idx_user_presence_last_seen", columnList = "last_seen_at"))
@Getter
@Setter
@NoArgsConstructor
public class UserPresence {
    @Id
    @Column(name = "user_id", length = 36, nullable = false)
    private String userId;

    @MapsId
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "last_seen_at", nullable = false)
    private LocalDateTime lastSeenAt;
}
