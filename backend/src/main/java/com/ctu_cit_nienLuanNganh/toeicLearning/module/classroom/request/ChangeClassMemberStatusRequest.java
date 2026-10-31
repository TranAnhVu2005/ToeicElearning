package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangeClassMemberStatusRequest {
    @NotNull
    @Pattern(regexp = "APPROVED|BLOCKED|REMOVED")
    private String status;
}
