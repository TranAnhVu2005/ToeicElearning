package com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.mapper;

import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.dto.AuthResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.model.User;
import org.springframework.stereotype.Component;

@Component
public class AuthMapper {
    public AuthResponseDTO toDTO(User u, String token){
        return AuthResponseDTO.builder()
                .id(u.getId())
                .userName(u.getUserName())
                .userEmail(u.getUserEmail())
                .userNumberphone(u.getUserNumberphone())
                .accessToken(token)
                .build();
    }
}
