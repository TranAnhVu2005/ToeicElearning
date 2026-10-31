package com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.dto.AdminOverviewMetricsResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.dto.DailyTestMetricsResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.TestResultRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.ExamSessionRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.UserPresenceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminMetricsService {
    private static final int ACTIVE_WINDOW_MINUTES = 5;
    private final UserPresenceRepository presenceRepository;
    private final TestResultRepository testResultRepository;
    private final ExamSessionRepository examSessionRepository;

    @Value("${app.reporting.time-zone:Asia/Ho_Chi_Minh}")
    private String reportingTimeZone;

    @Transactional
    public AdminOverviewMetricsResponse overview() {
        ZoneId zone = reportingZone();
        LocalDateTime now = LocalDateTime.now(zone);
        LocalDate today = now.toLocalDate();
        return AdminOverviewMetricsResponse.builder()
                .activeUsers(presenceRepository.countActiveUsers(now.minusMinutes(ACTIVE_WINDOW_MINUTES)))
                .activeWindowMinutes(ACTIVE_WINDOW_MINUTES)
                .submittedAttemptsToday(testResultRepository.countSubmittedBetween(
                        today.atStartOfDay(), today.plusDays(1).atStartOfDay()))
                .startedAttemptsToday(examSessionRepository.countStartedBetween(
                        today.atStartOfDay(), today.plusDays(1).atStartOfDay()))
                .reportingDate(today)
                .timeZone(zone.getId())
                .generatedAt(now)
                .build();
    }

    @Transactional
    public List<DailyTestMetricsResponse> dailyTests(LocalDate from, LocalDate to) {
        if (from == null || to == null || from.isAfter(to) || to.isAfter(LocalDate.now(reportingZone()))
                || from.plusDays(366).isBefore(to)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        LocalDateTime rangeStart = from.atStartOfDay();
        LocalDateTime rangeEnd = to.plusDays(1).atStartOfDay();
        Map<LocalDate, Long> submitted = readCounts(testResultRepository.countSubmittedByDay(rangeStart, rangeEnd));
        Map<LocalDate, Long> started = readCounts(examSessionRepository.countStartedByDay(rangeStart, rangeEnd));
        List<DailyTestMetricsResponse> result = new ArrayList<>();
        for (LocalDate day = from; !day.isAfter(to); day = day.plusDays(1)) {
            result.add(DailyTestMetricsResponse.builder().date(day)
                    .submittedAttempts(submitted.getOrDefault(day, 0L))
                    .startedAttempts(started.getOrDefault(day, 0L)).build());
        }
        return result;
    }

    private Map<LocalDate, Long> readCounts(List<Object[]> rows) {
        Map<LocalDate, Long> counts = new HashMap<>();
        for (Object[] row : rows) {
            Object dateValue = row[0];
            LocalDate date = dateValue instanceof Date sqlDate ? sqlDate.toLocalDate()
                    : dateValue instanceof LocalDate localDate ? localDate : LocalDate.parse(dateValue.toString());
            counts.put(date, ((Number) row[1]).longValue());
        }
        return counts;
    }

    private ZoneId reportingZone() {
        try {
            return ZoneId.of(reportingTimeZone);
        } catch (RuntimeException ignored) {
            throw new IllegalStateException("Invalid app.reporting.time-zone configuration");
        }
    }
}
