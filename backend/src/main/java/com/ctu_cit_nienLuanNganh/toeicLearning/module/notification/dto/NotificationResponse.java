package com.ctu_cit_nienLuanNganh.toeicLearning.module.notification.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class NotificationResponse {
    String id;
    String notificationId;
    String title;
    String content;
    String type;
    String category;
    String link;
    String referenceUrl;
    Boolean read;
    Boolean isRead;
    LocalDateTime createdAt;
}
