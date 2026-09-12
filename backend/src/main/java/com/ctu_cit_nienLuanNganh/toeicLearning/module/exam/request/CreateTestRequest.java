package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TestStatus;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateTestRequest {
    private String titleTest; // Tên bộ đề (VD: ETS 2024 - Test 1)
    private TestStatus status; // Trạng thái đề thi (DRAFT hoặc PUBLISHED)
    private List<TestPartRequest> parts; // Danh sách các phần thi trong đề
}
