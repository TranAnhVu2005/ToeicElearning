package com.ctu_cit_nienLuanNganh.toeicLearning.module.user.mapper;

import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.dto.UserResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserResponseDTO toDTO(User u)
    {
        if(u == null){
            return null;
        }
        return UserResponseDTO.builder()
                .id(u.getId())
                .userName(u.getUserName())
                .userEmail(u.getUserEmail())
                .userNumberphone(u.getUserNumberphone())
                .userAvatar(u.getUserAvatar())
                .build();
    }
}
