package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class ClassroomResponse {
    String id;
    String className;
    String description;
    String classCode;
    String themeColor;
    String bannerUrl;
    String teacherName;
    String teacherEmail;
    String status;
    Long approvedMemberCount;
    Long pendingMemberCount;
    LocalDateTime createdAt;
}
