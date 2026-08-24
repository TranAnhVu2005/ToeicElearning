package com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponseDTO {
    private String id;
    private String userName;
    private String userEmail;
    private String userNumberphone;
    private String accessToken; //Sử dụng sau cho JWT, hiện giờ chưa hiểu lắm
}
