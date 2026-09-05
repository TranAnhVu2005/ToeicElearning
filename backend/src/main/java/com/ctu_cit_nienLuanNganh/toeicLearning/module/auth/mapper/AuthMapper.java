package com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.mapper;

import com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.dto.AuthResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import org.springframework.stereotype.Component;

@Component
public class AuthMapper {
    public AuthResponseDTO toDTO(User u, String token){
        return AuthResponseDTO.builder()
                .id(u.getId())
                .userName(u.getUserName())
                .userEmail(u.getUserEmail())
                .userNumberphone(u.getUserNumberphone())
                .userAvatar(u.getUserAvatar())
                .role(u.getRole() != null ? u.getRole().getRoleName() : "ROLE_USER")
                .accessToken(token)
                .build();
    }
}
