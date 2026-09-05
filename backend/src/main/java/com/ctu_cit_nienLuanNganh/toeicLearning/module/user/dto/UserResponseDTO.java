package com.ctu_cit_nienLuanNganh.toeicLearning.module.user.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponseDTO {
    private String id;
    private String userName;
    private String userEmail;
    private String userNumberphone;
    private String userAvatar;
    private String role;
}
