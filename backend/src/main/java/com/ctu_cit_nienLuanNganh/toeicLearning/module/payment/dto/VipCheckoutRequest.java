package com.ctu_cit_nienLuanNganh.toeicLearning.module.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VipCheckoutRequest {
    @NotBlank
    @Size(max = 36)
    private String testId;
}
