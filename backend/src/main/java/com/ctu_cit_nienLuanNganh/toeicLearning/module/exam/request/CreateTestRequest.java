package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TestStatus;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.math.BigDecimal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Getter
@Setter
public class CreateTestRequest {
    @NotBlank(message = "Tên đề thi không được để trống")
    @Size(max = 255, message = "Tên đề thi tối đa 255 ký tự")
    private String titleTest; // Tên bộ đề (VD: ETS 2024 - Test 1)
    @Size(max = 2048, message = "Đường dẫn ảnh bìa tối đa 2048 ký tự")
    private String coverImageUrl;
    private Boolean clearCoverImage;
    private TestStatus status; // Trạng thái đề thi (DRAFT hoặc PUBLISHED)
    private List<TestPartRequest> parts; // Danh sách các phần thi trong đề
    private Boolean isVip;
    private BigDecimal vipPriceVnd;
    private String classroomId;
}
