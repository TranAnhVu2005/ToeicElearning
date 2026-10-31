package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiViews;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageParams;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TestStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TestCatalogCategory;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Test;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.SubmitExamResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.TestHistoryResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.TestResultDetailResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.TestAccessResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.DictationResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.ExamSessionResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.PartForUserResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request.CreateTestRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request.SubmitExamAnswer;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request.StartExamSessionRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request.SaveExamSessionAnswersRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.service.ExamService;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.service.LoginRateLimitService;
import com.fasterxml.jackson.annotation.JsonView;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/exam")
@RequiredArgsConstructor
public class ExamController {
    private final ExamService examService;
    private final LoginRateLimitService rateLimitService;
    @GetMapping("/list")
    @JsonView(ApiViews.Public.class)
    public ResponseEntity<ApiResponse<PageResponse<Test>>> getFullTest(
            @ModelAttribute PageParams pageParams,
            @RequestParam(defaultValue = "ALL") TestCatalogCategory category,
            HttpServletRequest httpRequest){
        limit("exam-catalog", httpRequest, null, 120, 0);
        PageResponse<Test> testLists = examService.getFullTest(pageParams, TestStatus.PUBLISHED, category);
        return  ResponseEntity
                .ok(ApiResponse.success("Lấy danh sách tất cả các test thành công",testLists));
    }

    @GetMapping("/admin/list")
    @PreAuthorize("hasRole('ADMIN')")
    @JsonView(ApiViews.Admin.class)
    public ResponseEntity<ApiResponse<PageResponse<Test>>> getAdminTests(
            @ModelAttribute PageParams pageParams,
            @RequestParam TestStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đề quản trị thành công",
                examService.getAdminTests(pageParams, status)));
    }

    @GetMapping("/{testID}")
    @JsonView(ApiViews.ExamDetail.class)
    public ResponseEntity<ApiResponse<Test>> getDetailTest(@PathVariable String testID,
                                                            @AuthenticationPrincipal User currentUser,
                                                            HttpServletRequest httpRequest){
        limit("exam-detail", httpRequest, currentUser, 60, 30);
        Test test = examService.getTestDetail(testID, currentUser);
        return ResponseEntity
                .ok(ApiResponse.success("Xem chi tiết test",test));
    }

    @GetMapping("/{testID}/access")
    public ResponseEntity<ApiResponse<TestAccessResponse>> getTestAccess(
            @PathVariable String testID, @AuthenticationPrincipal User currentUser,
            HttpServletRequest httpRequest) {
        limit("exam-access", httpRequest, currentUser, 120, 60);
        return ResponseEntity.ok(ApiResponse.success(examService.getTestAccess(testID, currentUser)));
    }

    @GetMapping("/{testID}/dictation")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DictationResponseDTO>> getDictationData(
            @PathVariable String testID,
            @AuthenticationPrincipal User currentUser,
            HttpServletRequest httpRequest) {
        limit("exam-dictation", httpRequest, currentUser, 60, 30);
        return ResponseEntity.ok(ApiResponse.success("Lấy nội dung luyện chép chính tả thành công",
                examService.getDictationData(testID, currentUser)));
    }

    @GetMapping("/{testID}/parts/{partID}") // Định nghĩa rõ ràng đường dẫn lấy part của test
    @JsonView(ApiViews.ExamDetail.class)
    public ResponseEntity<ApiResponse<PartForUserResponseDTO>> getPart(
            @PathVariable String testID,
            @PathVariable String partID,
            @AuthenticationPrincipal User currentUser,
            HttpServletRequest httpRequest
    ){
        limit("exam-part", httpRequest, currentUser, 60, 30);
        PartForUserResponseDTO result = examService.getPart(testID, partID, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Lấy part thành công", result));
    }

    @GetMapping("/admin/{testID}")
    @PreAuthorize("hasRole('ADMIN')")
    @JsonView(ApiViews.Admin.class)
    public ResponseEntity<ApiResponse<Test>> getAdminTestDetail(@PathVariable String testID) {
        return ResponseEntity.ok(ApiResponse.success("Xem chi tiết đề quản trị", examService.getAdminTestDetail(testID)));
    }

    @GetMapping("/classrooms/{classroomId}/tests")
    @PreAuthorize("hasRole('TEACHER')")
    @JsonView(ApiViews.Public.class)
    public ResponseEntity<ApiResponse<PageResponse<Test>>> getClassroomTests(
            @AuthenticationPrincipal User teacher, @PathVariable String classroomId,
            @ModelAttribute PageParams pageParams) {
        return ResponseEntity.ok(ApiResponse.success(examService.getClassroomTests(teacher, classroomId, pageParams)));
    }

    @GetMapping("/classrooms/{classroomId}/tests/{testId}")
    @PreAuthorize("hasRole('TEACHER')")
    @JsonView(ApiViews.Admin.class)
    public ResponseEntity<ApiResponse<Test>> getClassroomTestDetail(
            @AuthenticationPrincipal User teacher, @PathVariable String classroomId, @PathVariable String testId) {
        return ResponseEntity.ok(ApiResponse.success(examService.getClassroomTestDetail(teacher, classroomId, testId)));
    }

    @GetMapping("/classrooms/{classroomId}/tests/assignable")
    @PreAuthorize("hasRole('TEACHER')")
    @JsonView(ApiViews.Public.class)
    public ResponseEntity<ApiResponse<PageResponse<Test>>> getAssignableTests(
            @AuthenticationPrincipal User teacher, @PathVariable String classroomId,
            @ModelAttribute PageParams pageParams) {
        return ResponseEntity.ok(ApiResponse.success(examService.getAssignableTests(teacher, classroomId, pageParams)));
    }

    @PostMapping("/classrooms/{classroomId}/tests")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<Void>> createClassroomTest(
            @AuthenticationPrincipal User teacher, @PathVariable String classroomId,
            @Valid @RequestBody CreateTestRequest request) {
        examService.createClassroomTest(teacher, classroomId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Đã tạo đề riêng cho lớp"));
    }

    @PutMapping("/classrooms/{classroomId}/tests/{testId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<Void>> updateClassroomTest(
            @AuthenticationPrincipal User teacher, @PathVariable String classroomId, @PathVariable String testId,
            @Valid @RequestBody CreateTestRequest request) {
        examService.updateClassroomTest(teacher, classroomId, testId, request);
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật đề riêng của lớp"));
    }

    @PatchMapping("/classrooms/{classroomId}/tests/{testId}/publish")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<Void>> publishClassroomTest(
            @AuthenticationPrincipal User teacher, @PathVariable String classroomId, @PathVariable String testId) {
        examService.publishClassroomTest(teacher, classroomId, testId);
        return ResponseEntity.ok(ApiResponse.success("Đã phát hành đề trong lớp"));
    }

    @DeleteMapping("/classrooms/{classroomId}/tests/{testId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteClassroomTest(
            @AuthenticationPrincipal User teacher, @PathVariable String classroomId, @PathVariable String testId) {
        examService.deleteClassroomTest(teacher, classroomId, testId);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa đề riêng khỏi lớp"));
    }

    @PostMapping("/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SubmitExamResponseDTO>> submitExam(
            @AuthenticationPrincipal User currentUser, @Valid @RequestBody SubmitExamAnswer request,
            HttpServletRequest httpRequest) {
        limit("exam-submit", httpRequest, currentUser, 30, 15);
        return ResponseEntity.ok(ApiResponse.success("Nộp bài thành công", examService.submitExam(currentUser, request)));
    }

    @PostMapping("/sessions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ExamSessionResponse>> startExamSession(
            @AuthenticationPrincipal User currentUser, @Valid @RequestBody StartExamSessionRequest request,
            HttpServletRequest httpRequest) {
        limit("exam-session-start", httpRequest, currentUser, 30, 15);
        return ResponseEntity.ok(ApiResponse.success("Phiên làm bài đã sẵn sàng",
                examService.startExamSession(currentUser, request)));
    }

    @PatchMapping("/sessions/{sessionId}/answers")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ExamSessionResponse>> saveExamSessionAnswers(
            @AuthenticationPrincipal User currentUser, @PathVariable String sessionId,
            @Valid @RequestBody SaveExamSessionAnswersRequest request, HttpServletRequest httpRequest) {
        limit("exam-session-save", httpRequest, currentUser, 600, 600);
        return ResponseEntity.ok(ApiResponse.success("Đã lưu đáp án nháp",
                examService.saveExamSessionAnswers(currentUser, sessionId, request)));
    }

    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<java.util.List<TestHistoryResponseDTO>>> getTestHistory(
            @AuthenticationPrincipal User currentUser, @RequestParam(required = false) String testId) {
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử làm bài thành công", examService.getTestHistory(currentUser, testId)));
    }

    @GetMapping("/results/{resultId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TestResultDetailResponseDTO>> getTestResultDetail(
            @AuthenticationPrincipal User currentUser, @PathVariable String resultId) {
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết bài làm thành công", examService.getTestResultDetail(currentUser, resultId)));
    }

    @GetMapping("/assignment-results/{resultId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<TestResultDetailResponseDTO>> getAssignmentResultDetail(
            @AuthenticationPrincipal User currentUser, @PathVariable String resultId) {
        return ResponseEntity.ok(ApiResponse.success("Lấy bài nộp của lớp thành công",
                examService.getAssignmentResultDetail(currentUser, resultId)));
    }
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> createFullTest(
            @AuthenticationPrincipal User admin, @Valid @RequestBody CreateTestRequest request){
        examService.createFullTest(admin, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo đề thi thành công"));
    }

    @PutMapping("/update/{testID}")
    @PreAuthorize("hasRole('ADMIN')")
    public  ResponseEntity<ApiResponse<Void>> updateTest(
            @AuthenticationPrincipal User admin,
            @PathVariable  String testID,
            @Valid @RequestBody CreateTestRequest request){
        examService.updateFullTest(admin, testID, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật đề thi thành công"));
    }

    @PatchMapping("/{testID}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> publishTest(
            @AuthenticationPrincipal User admin, @PathVariable String testID) {
        examService.publishTest(admin, testID);
        return ResponseEntity.ok(ApiResponse.success("Xuất bản đề thi thành công"));
    }

    @PatchMapping("/{testID}/draft")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> draftTest(
            @AuthenticationPrincipal User admin, @PathVariable String testID) {
        examService.draftTest(admin, testID);
        return ResponseEntity.ok(ApiResponse.success("Chuyển đề thi về bản nháp thành công"));
    }

    @DeleteMapping("/delete/{testID}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteFullTest(
            @AuthenticationPrincipal User admin, @PathVariable String testID)
    {
        boolean archived = examService.deleteFullTest(admin, testID);
        return ResponseEntity.ok(ApiResponse.success(archived
                ? "Đề đã có lịch sử và được chuyển về bản nháp để giữ dữ liệu review"
                : "Xóa đề thi thành công", archived ? "ARCHIVED" : "DELETED"));
    }

    private void limit(String scope, HttpServletRequest request, User user, int ipLimit, int userLimit) {
        String userId = user == null ? null : user.getId();
        String ip = request == null ? null : request.getRemoteAddr();
        rateLimitService.checkAllowed(scope, ip, userId, ipLimit, userId == null ? 0 : userLimit);
        rateLimitService.recordAttempt(scope, ip, userId, ipLimit, userId == null ? 0 : userLimit);
    }
}
