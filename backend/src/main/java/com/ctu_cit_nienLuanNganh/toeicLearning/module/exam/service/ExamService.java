package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageParams;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TestStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Test;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.PartForUserResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.SubmitExamResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.TestHistoryResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.TestResultDetailResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request.CreateTestRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request.SubmitExamAnswer;

import java.util.List;

public interface ExamService {
    // 1. Quản trị & Hiển thị đề thi
    PageResponse<Test> getFullTest(PageParams pageParams, TestStatus status);
    Test getTestDetail(String testID);
    PartForUserResponseDTO getPart(String testId, String partId);
    void createFullTest(CreateTestRequest request);
    void updateFullTest(String testID, CreateTestRequest request);
    void publishTest(String testID);
    void draftTest(String testID);
    void deleteFullTest(String testID);

    // 2. Nộp bài thi & Lịch sử làm bài (Test History & Review)
    SubmitExamResponseDTO submitExam(User currentUser, SubmitExamAnswer request);
    List<TestHistoryResponseDTO> getTestHistory(User currentUser, String testId);
    TestResultDetailResponseDTO getTestResultDetail(User currentUser, String resultId);
}
