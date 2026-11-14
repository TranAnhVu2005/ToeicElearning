package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.AuditEvent;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditEventRepository extends BaseRepository<AuditEvent, String> {
    Page<AuditEvent> findAllByOrderByOccurredAtUtcDesc(Pageable pageable);

    @Query("SELECT a.occurredAtUtc, a.actorUserId FROM AuditEvent a " +
            "WHERE a.action = 'LOGIN_SUCCEEDED' " +
            "AND a.occurredAtUtc >= :fromUtc AND a.occurredAtUtc < :toUtc")
    List<Object[]> findSuccessfulLoginsBetween(@Param("fromUtc") LocalDateTime fromUtc,
                                               @Param("toUtc") LocalDateTime toUtc);
}
