package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateTestRequest {
    private String titleTest; // Tên bộ đề (VD: ETS 2024 - Test 1)
    private List<TestPartRequest> parts; // Danh sách các phần thi trong đề
}
