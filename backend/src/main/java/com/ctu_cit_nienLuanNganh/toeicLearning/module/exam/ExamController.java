package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageParams;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TestStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Test;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request.CreateTestRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.service.ExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exam")
@RequiredArgsConstructor
public class ExamController {
    private final ExamService examService;
    @GetMapping("/list")
    public ResponseEntity<ApiResponse<PageResponse<Test>>> getFullTest(
            @ModelAttribute PageParams pageParams,
            @RequestParam(required = false) TestStatus status){
        PageResponse<Test> testLists = examService.getFullTest(pageParams, status);
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
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> createFullTest(@Valid @RequestBody CreateTestRequest request){
        examService.createFullTest(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo đề thi thành công"));
    }

    @PutMapping("/update/{testID}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public  ResponseEntity<ApiResponse<Void>> updateTest(
            @PathVariable  String testID,
            @Valid @RequestBody CreateTestRequest request){
        examService.updateFullTest(testID, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật đề thi thành công"));
    }

    @PatchMapping("/{testID}/publish")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> publishTest(@PathVariable String testID) {
        examService.publishTest(testID);
        return ResponseEntity.ok(ApiResponse.success("Xuất bản đề thi thành công"));
    }

    @PatchMapping("/{testID}/draft")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> draftTest(@PathVariable String testID) {
        examService.draftTest(testID);
        return ResponseEntity.ok(ApiResponse.success("Chuyển đề thi về bản nháp thành công"));
    }

    @DeleteMapping("/delete/{testID}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFullTest(@PathVariable String testID)
    {
        examService.deleteFullTest(testID);
        return ResponseEntity.ok(ApiResponse.success("Xóa đề thi thành công"));
    }
}
