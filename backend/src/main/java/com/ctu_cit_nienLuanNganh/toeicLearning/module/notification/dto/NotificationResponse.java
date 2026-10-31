package com.ctu_cit_nienLuanNganh.toeicLearning.module.notification.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class NotificationResponse {
    String id;
    String title;
    String content;
    String type;
    String link;
    Boolean read;
    LocalDateTime createdAt;
}
