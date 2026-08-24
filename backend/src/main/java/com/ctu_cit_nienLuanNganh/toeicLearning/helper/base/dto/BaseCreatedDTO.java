package com.ctu_cit_nienLuanNganh.toeicLearning.helper.base.dto;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter
@Setter
@SuperBuilder
public abstract class  BaseCreatedDTO extends BaseDTO{
    private LocalDateTime createdAt;
}
