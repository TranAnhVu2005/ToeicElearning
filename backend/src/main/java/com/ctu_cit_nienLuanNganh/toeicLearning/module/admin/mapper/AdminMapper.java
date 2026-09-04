package com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.mapper;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.dto.AdminResponseDTO;
import org.springframework.stereotype.Component;

@Component
//Chuyển từ dôi tượng về json cho client
public class AdminMapper {
    public AdminResponseDTO toDTO(User user)
    {
        return AdminResponseDTO
                .builder()
                .id(user.getId())
                .userName(user.getUserName())
                .userEmail(user.getUserEmail())
                .userNumberphone(user.getUserNumberphone())
                .isLocked(user.getIsLocked())
                .roleId(user.getRoleId())
                .build();
    }
}
