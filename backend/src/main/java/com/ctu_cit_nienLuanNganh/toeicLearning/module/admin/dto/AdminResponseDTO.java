package com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.dto;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.BaseCreatedUpdatedDTO;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
public class AdminResponseDTO extends BaseCreatedUpdatedDTO {
    private String userName;
    private String userEmail;
    private String userNumberphone;
    private String userAvatar;

    @JsonProperty("isLocked")
    private boolean isLocked;
    private String roleName;
}
