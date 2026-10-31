package com.ctu_cit_nienLuanNganh.toeicLearning.module.user.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.UserPresenceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class UserPresenceService {
    private final UserPresenceRepository presenceRepository;

    @Value("${app.reporting.time-zone:Asia/Ho_Chi_Minh}")
    private String reportingTimeZone;

    @Transactional
    public void heartbeat(User user) {
        LocalDateTime now = LocalDateTime.now(ZoneId.of(reportingTimeZone));
        // Store no more than one heartbeat per user per minute, even with multiple tabs.
        presenceRepository.touchPresence(user.getId(), now, now.minusMinutes(1));
    }
}
