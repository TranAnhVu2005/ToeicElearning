package com.ctu_cit_nienLuanNganh.toeicLearning.api.user.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponeDTO {
    private String id;
    private String userName;
    private String userEmail;
    private String userNumberphone;
    private String userAvatar;
}
