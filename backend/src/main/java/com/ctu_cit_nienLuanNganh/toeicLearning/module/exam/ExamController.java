package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageParams;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Test;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request.CreateTestRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.service.ExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exam")
@RequiredArgsConstructor
public class ExamController {
    private final ExamService examService;
    @GetMapping("/list")
    public ResponseEntity<ApiResponse<PageResponse<Test>>> getFullTest(@ModelAttribute PageParams pageParams){
        PageResponse<Test> testLists = examService.getFullTest(pageParams);
        return  ResponseEntity
                .ok(ApiResponse.success("Lấy danh sách tất cả các test thành công",testLists));
    }

    @GetMapping("/{testID}")
    public ResponseEntity<ApiResponse<Test>> getDetailTest(@PathVariable String testID){
        Test test = examService.getTestDetail(testID);
        return ResponseEntity
                .ok(ApiResponse.success("Xem chi tiết test",test));
    }


    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Void>> createFullTest(@Valid @RequestBody CreateTestRequest request){
        examService.createFullTest(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo đề thi thành công"));
    }

    @PutMapping("/update/{testID}")
    public  ResponseEntity<ApiResponse<Void>> updateTest(
            @PathVariable  String testID,
            @Valid @RequestBody CreateTestRequest request){
        examService.updateFullTest(testID, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật đề thi thành công"));
    }

    @DeleteMapping("/delete/{testID}")
    public ResponseEntity<ApiResponse<Void>> deleteFullTest(@PathVariable String testID)
    {
        examService.deleteFullTest(testID);
        return ResponseEntity.ok(ApiResponse.success("Xóa đề thi thành công"));
    }
}
