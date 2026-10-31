package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ClassroomResponse {
    String id;
    String className;
    String description;
    String classCode;
    String teacherName;
    String status;
}
