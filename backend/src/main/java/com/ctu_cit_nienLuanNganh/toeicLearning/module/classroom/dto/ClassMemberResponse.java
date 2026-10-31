package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class ClassMemberResponse {
    String id;
    String studentId;
    String studentName;
    String studentEmail;
    String status;
    LocalDateTime joinedAt;
}
