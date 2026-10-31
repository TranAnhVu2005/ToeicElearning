package com.ctu_cit_nienLuanNganh.toeicLearning.module.user.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SetLocalPasswordRequest {
    @NotBlank
    @Size(max = 20_000)
    private String googleIdToken;

    @NotBlank
    @Size(min = 6, max = 100)
    private String newUserPassword;
}
