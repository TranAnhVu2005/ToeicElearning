package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageParams;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TestStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TestCatalogCategory;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Test;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request.CreateTestRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.PartForUserResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.SubmitExamResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.TestHistoryResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.TestResultDetailResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.TestAccessResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.DictationResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.ExamSessionResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request.CreateTestRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request.SubmitExamAnswer;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request.StartExamSessionRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request.SaveExamSessionAnswersRequest;

import java.util.List;

public interface ExamService {
    // 1. Quản trị & Hiển thị đề thi
    PageResponse<Test> getFullTest(PageParams pageParams, TestStatus status, TestCatalogCategory category);
    PageResponse<Test> getAdminTests(PageParams pageParams, TestStatus status);
    PageResponse<Test> getClassroomTests(User teacher, String classroomId, PageParams pageParams);
    PageResponse<Test> getAssignableTests(User teacher, String classroomId, PageParams pageParams);
    Test getClassroomTestDetail(User teacher, String classroomId, String testId);
    void createClassroomTest(User teacher, String classroomId, CreateTestRequest request);
    void updateClassroomTest(User teacher, String classroomId, String testId, CreateTestRequest request);
    void publishClassroomTest(User teacher, String classroomId, String testId);
    void deleteClassroomTest(User teacher, String classroomId, String testId);
    Test getTestDetail(String testID, User currentUser);
    TestAccessResponse getTestAccess(String testID, User currentUser);
    DictationResponseDTO getDictationData(String testID, User currentUser);
    Test getAdminTestDetail(String testID);
    PartForUserResponseDTO getPart(String testId, String partId, User currentUser);
    void createFullTest(User admin, CreateTestRequest request);
    void updateFullTest(User admin, String testID, CreateTestRequest request);
    void publishTest(User admin, String testID);
    void draftTest(User admin, String testID);
    boolean deleteFullTest(User admin, String testID);

    // 2. Nộp bài thi & Lịch sử làm bài (Test History & Review)
    SubmitExamResponseDTO submitExam(User currentUser, SubmitExamAnswer request);
    ExamSessionResponse startExamSession(User currentUser, StartExamSessionRequest request);
    ExamSessionResponse saveExamSessionAnswers(User currentUser, String sessionId, SaveExamSessionAnswersRequest request);
    List<TestHistoryResponseDTO> getTestHistory(User currentUser, String testId);
    TestResultDetailResponseDTO getTestResultDetail(User currentUser, String resultId);
    TestResultDetailResponseDTO getAssignmentResultDetail(User teacher, String resultId);
}
