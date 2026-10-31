package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.AuditEvent;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuditEventRepository extends BaseRepository<AuditEvent, String> {
    Page<AuditEvent> findAllByOrderByOccurredAtUtcDesc(Pageable pageable);
}
