package com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.dto.ActivityMetricsPointResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.dto.AdminOverviewMetricsResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.dto.DailyTestMetricsResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.AuditEventRepository;
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
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class AdminMetricsService {
    private static final int ACTIVE_WINDOW_MINUTES = 5;
    private static final int MAX_MONTHLY_SERIES = 24;
    private final UserPresenceRepository presenceRepository;
    private final TestResultRepository testResultRepository;
    private final ExamSessionRepository examSessionRepository;
    private final AuditEventRepository auditEventRepository;

    @Value("${app.reporting.time-zone:Asia/Ho_Chi_Minh}")
    private String reportingTimeZone;

    @Transactional
    public AdminOverviewMetricsResponse overview() {
        ZoneId zone = reportingZone();
        LocalDateTime now = LocalDateTime.now(zone);
        LocalDate today = now.toLocalDate();
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime tomorrowStart = today.plusDays(1).atStartOfDay();
        LocalDateTime monthStartDt = monthStart.atStartOfDay();

        LoginAggregate todayLogins = summarizeLogins(todayStart, tomorrowStart, zone);
        LoginAggregate monthLogins = summarizeLogins(monthStartDt, tomorrowStart, zone);

        return AdminOverviewMetricsResponse.builder()
                .activeUsers(presenceRepository.countActiveUsers(now.minusMinutes(ACTIVE_WINDOW_MINUTES)))
                .activeWindowMinutes(ACTIVE_WINDOW_MINUTES)
                .submittedAttemptsToday(testResultRepository.countSubmittedBetween(todayStart, tomorrowStart))
                .startedAttemptsToday(examSessionRepository.countStartedBetween(todayStart, tomorrowStart))
                .uniqueLoginsToday(todayLogins.uniqueUsers.size())
                .loginCountToday(todayLogins.totalEvents)
                .uniqueLoginsThisMonth(monthLogins.uniqueUsers.size())
                .startedAttemptsThisMonth(examSessionRepository.countStartedBetween(monthStartDt, tomorrowStart))
                .submittedAttemptsThisMonth(testResultRepository.countSubmittedBetween(monthStartDt, tomorrowStart))
                .reportingDate(today)
                .timeZone(zone.getId())
                .generatedAt(now)
                .build();
    }

    @Transactional
    public List<DailyTestMetricsResponse> dailyTests(LocalDate from, LocalDate to) {
        validateDailyRange(from, to);
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

    @Transactional
    public List<ActivityMetricsPointResponse> dailyActivity(LocalDate from, LocalDate to) {
        validateDailyRange(from, to);
        ZoneId zone = reportingZone();
        LocalDateTime rangeStart = from.atStartOfDay();
        LocalDateTime rangeEnd = to.plusDays(1).atStartOfDay();

        Map<LocalDate, Long> submitted = readCounts(testResultRepository.countSubmittedByDay(rangeStart, rangeEnd));
        Map<LocalDate, Long> started = readCounts(examSessionRepository.countStartedByDay(rangeStart, rangeEnd));
        Map<LocalDate, LoginAggregate> logins = aggregateLogins(rangeStart, rangeEnd, zone, LocalDate::from);

        List<ActivityMetricsPointResponse> result = new ArrayList<>();
        for (LocalDate day = from; !day.isAfter(to); day = day.plusDays(1)) {
            LoginAggregate loginAgg = logins.get(day);
            result.add(ActivityMetricsPointResponse.builder()
                    .period(day.toString())
                    .uniqueLoginUsers(loginAgg != null ? loginAgg.uniqueUsers.size() : 0L)
                    .loginCount(loginAgg != null ? loginAgg.totalEvents : 0L)
                    .startedAttempts(started.getOrDefault(day, 0L))
                    .submittedAttempts(submitted.getOrDefault(day, 0L))
                    .build());
        }
        return result;
    }

    @Transactional
    public List<ActivityMetricsPointResponse> monthlyActivity(int months) {
        if (months < 1 || months > MAX_MONTHLY_SERIES) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        ZoneId zone = reportingZone();
        LocalDate today = LocalDate.now(zone);
        YearMonth currentMonth = YearMonth.from(today);
        YearMonth startMonth = currentMonth.minusMonths(months - 1L);

        LocalDateTime rangeStart = startMonth.atDay(1).atStartOfDay();
        LocalDateTime rangeEnd = today.plusDays(1).atStartOfDay();

        Map<YearMonth, Long> submittedByMonth = sumDailyToMonth(
                readCounts(testResultRepository.countSubmittedByDay(rangeStart, rangeEnd)));
        Map<YearMonth, Long> startedByMonth = sumDailyToMonth(
                readCounts(examSessionRepository.countStartedByDay(rangeStart, rangeEnd)));
        Map<YearMonth, LoginAggregate> loginsByMonth = aggregateLogins(rangeStart, rangeEnd, zone, YearMonth::from);

        List<ActivityMetricsPointResponse> result = new ArrayList<>();
        for (YearMonth ym = startMonth; !ym.isAfter(currentMonth); ym = ym.plusMonths(1)) {
            LoginAggregate loginAgg = loginsByMonth.get(ym);
            result.add(ActivityMetricsPointResponse.builder()
                    .period(ym.toString())
                    .uniqueLoginUsers(loginAgg != null ? loginAgg.uniqueUsers.size() : 0L)
                    .loginCount(loginAgg != null ? loginAgg.totalEvents : 0L)
                    .startedAttempts(startedByMonth.getOrDefault(ym, 0L))
                    .submittedAttempts(submittedByMonth.getOrDefault(ym, 0L))
                    .build());
        }
        return result;
    }

    private void validateDailyRange(LocalDate from, LocalDate to) {
        if (from == null || to == null || from.isAfter(to) || to.isAfter(LocalDate.now(reportingZone()))
                || from.plusDays(366).isBefore(to)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
    }

    private LoginAggregate summarizeLogins(LocalDateTime localStart, LocalDateTime localEnd, ZoneId zone) {
        LoginAggregate aggregate = new LoginAggregate();
        for (Object[] row : fetchLogins(localStart, localEnd, zone)) {
            aggregate.record(row[1] != null ? row[1].toString() : null);
        }
        return aggregate;
    }

    private <K> Map<K, LoginAggregate> aggregateLogins(
            LocalDateTime localStart, LocalDateTime localEnd, ZoneId zone, Function<LocalDate, K> bucketMapper) {
        Map<K, LoginAggregate> buckets = new HashMap<>();
        for (Object[] row : fetchLogins(localStart, localEnd, zone)) {
            LocalDateTime occurredUtc = (LocalDateTime) row[0];
            LocalDate localDate = occurredUtc.atZone(ZoneOffset.UTC).withZoneSameInstant(zone).toLocalDate();
            K key = bucketMapper.apply(localDate);
            buckets.computeIfAbsent(key, ignored -> new LoginAggregate())
                    .record(row[1] != null ? row[1].toString() : null);
        }
        return buckets;
    }

    private List<Object[]> fetchLogins(LocalDateTime localStart, LocalDateTime localEnd, ZoneId zone) {
        LocalDateTime utcStart = localStart.atZone(zone).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
        LocalDateTime utcEnd = localEnd.atZone(zone).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
        return auditEventRepository.findSuccessfulLoginsBetween(utcStart, utcEnd);
    }

    private Map<YearMonth, Long> sumDailyToMonth(Map<LocalDate, Long> dailyCounts) {
        Map<YearMonth, Long> byMonth = new HashMap<>();
        dailyCounts.forEach((date, count) -> byMonth.merge(YearMonth.from(date), count, Long::sum));
        return byMonth;
    }

    private static final class LoginAggregate {
        private final Set<String> uniqueUsers = new HashSet<>();
        private long totalEvents;

        private void record(String actorUserId) {
            totalEvents++;
            if (actorUserId != null && !actorUserId.isBlank()) {
                uniqueUsers.add(actorUserId);
            }
        }
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
