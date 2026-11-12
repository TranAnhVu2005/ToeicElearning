package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponseDTO {
    private String id;
    private String testId;
    private String userId;
    private String userName;
    private String userAvatar;
    private String roleName;
    private boolean isOfficial;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

