package com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class LoginRateLimitService {
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final int IP_LIMIT = 20;
    private static final int IDENTIFIER_LIMIT = 8;
    private final JdbcTemplate jdbcTemplate;

    public void checkAllowed(String ip, String identifier) {
        checkAllowed("login", ip, identifier, IP_LIMIT, IDENTIFIER_LIMIT);
    }

    public void checkAllowed(String scope, String ip, String identifier, int ipLimit, int identifierLimit) {
        LocalDateTime cutoff = LocalDateTime.now().minus(WINDOW);
        if (countAttempts(key(scope + ":ip", ip), cutoff) >= ipLimit
                || (identifier != null && countAttempts(identifierBucket(scope, ip, identifier), cutoff) >= identifierLimit)) {
            throw new AppException(ErrorCode.AUTH_RATE_LIMITED);
        }
    }

    public void recordFailure(String ip, String identifier) {
        recordAttempt("login", ip, identifier, IP_LIMIT, IDENTIFIER_LIMIT);
    }

    public void recordAttempt(String scope, String ip, String identifier, int ipLimit, int identifierLimit) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cutoff = now.minus(WINDOW);
        String ipBucket = key(scope + ":ip", ip);
        increment(ipBucket, now, cutoff);
        if (identifier != null) {
            increment(identifierBucket(scope, ip, identifier), now, cutoff);
        }
        if (countAttempts(ipBucket, cutoff) > ipLimit
                || (identifier != null && countAttempts(identifierBucket(scope, ip, identifier), cutoff) > identifierLimit)) {
            throw new AppException(ErrorCode.AUTH_RATE_LIMITED);
        }
    }

    private int countAttempts(String bucketKey, LocalDateTime cutoff) {
        Integer count = jdbcTemplate.query(
                "SELECT attempt_count FROM auth_login_attempt WHERE bucket_key = ? AND window_started_at >= ?",
                resultSet -> resultSet.next() ? resultSet.getInt(1) : 0, bucketKey, cutoff);
        return count == null ? 0 : count;
    }

    private void increment(String bucketKey, LocalDateTime now, LocalDateTime cutoff) {
        jdbcTemplate.update("""
                INSERT INTO auth_login_attempt (bucket_key, attempt_count, window_started_at)
                VALUES (?, 1, ?)
                ON DUPLICATE KEY UPDATE
                  attempt_count = IF(window_started_at < ?, 1, attempt_count + 1),
                  window_started_at = IF(window_started_at < ?, ?, window_started_at)
                """, bucketKey, now, cutoff, cutoff, now);
    }

    private String normalize(String identifier) {
        return identifier == null ? "" : identifier.trim().toLowerCase(Locale.ROOT);
    }

    private String identifierBucket(String scope, String ip, String identifier) {
        return key(scope + ":ip-identifier", (ip == null ? "" : ip) + ":" + normalize(identifier));
    }

    private String key(String scope, String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest((scope + ":" + (value == null ? "" : value)).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    @Scheduled(fixedDelay = 3_600_000L)
    public void cleanupExpiredBuckets() {
        jdbcTemplate.update("DELETE FROM auth_login_attempt WHERE window_started_at < ?", LocalDateTime.now().minusDays(1));
    }
}
