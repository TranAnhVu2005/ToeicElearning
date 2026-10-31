package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto;

import java.time.LocalDateTime;

public record MaterialResponse(
        String id,
        String title,
        String originalFileName,
        Long sizeBytes,
        String contentType,
        LocalDateTime createdAt,
        String uploadedByName,
        boolean downloadable
) { }
