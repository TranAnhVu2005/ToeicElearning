package com.ctu_cit_nienLuanNganh.toeicLearning.module.user.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class UserResponseDTO {
    private String id;
    private String userName;
    private String userEmail;
    private String userNumberphone;
    private String userAvatar;
    private String role;
    private Integer currentStreak;
    private Integer highestStreak;
    private Integer totalScore;
    private LocalDate lastActiveDate;
    private boolean hasLocalPassword;
    private boolean canSetLocalPassword;
}
