package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TestStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class TestMetadataRequest {
    @NotBlank(message = "Tên đề thi không được để trống")
    @Size(max = 255, message = "Tên đề thi tối đa 255 ký tự")
    private String titleTest;

    @Size(max = 2048, message = "Đường dẫn ảnh bìa tối đa 2048 ký tự")
    private String coverImageUrl;

    private Boolean clearCoverImage;

    private TestStatus status;

    private Boolean isVip;

    private BigDecimal vipPriceVnd;
}
