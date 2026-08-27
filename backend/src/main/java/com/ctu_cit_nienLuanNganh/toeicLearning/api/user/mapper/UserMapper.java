package com.ctu_cit_nienLuanNganh.toeicLearning.api.user.mapper;

import com.ctu_cit_nienLuanNganh.toeicLearning.api.user.dto.UserResponeDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserResponeDTO toDTO(User u)
    {
        if(u == null){
            return null;
        }
        return UserResponeDTO.builder()
                .id(u.getId())
                .userName(u.getUserName())
                .userEmail(u.getUserEmail())
                .userNumberphone(u.getUserNumberphone())
                .userAvatar(u.getUserAvatar())
                .build();
    }
}
