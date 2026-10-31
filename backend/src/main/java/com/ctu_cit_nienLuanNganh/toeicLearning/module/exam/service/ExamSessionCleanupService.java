package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ExamSessionStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.ExamSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExamSessionCleanupService {
    private final ExamSessionRepository examSessionRepository;

    @Scheduled(fixedDelayString = "${APP_EXAM_SESSION_CLEANUP_DELAY_MS:300000}")
    public void expireDrafts() {
        int expired = examSessionRepository.expireAndClearDrafts(
                ExamSessionStatus.ACTIVE, ExamSessionStatus.EXPIRED, LocalDateTime.now());
        if (expired > 0) log.info("Expired {} exam session drafts", expired);
    }
}
