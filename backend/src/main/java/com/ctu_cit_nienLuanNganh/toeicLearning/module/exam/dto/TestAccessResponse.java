package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

@Value
@Builder
public class TestAccessResponse {
    String testId;
    String title;
    String status;
    boolean vip;
    BigDecimal priceVnd;
    boolean hasAccess;
}
