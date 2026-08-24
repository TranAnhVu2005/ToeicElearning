package com.ctu_cit_nienLuanNganh.toeicLearning.helper.base.dto;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder

public abstract class BaseCreatedUpdatedDTO extends BaseCreatedDTO {
    private LocalDateTime updatedAt;
}
