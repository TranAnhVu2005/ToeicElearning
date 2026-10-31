package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Builder
public class ExamSessionResponse {
    private String sessionId;
    private String testId;
    private String status;
    private boolean resumed;
    private boolean stopwatch;
    private boolean timeUp;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime serverNow;
    private long remainingSeconds;
    private long elapsedSeconds;
    private Map<String, Character> answers;
}
