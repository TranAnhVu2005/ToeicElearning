package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto.ClassMemberResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto.ClassroomResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto.AssignmentResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto.AssignmentSubmissionResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto.AssignmentSummaryResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto.MaterialDownloadResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto.MaterialResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.request.AssignmentFeedbackRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.request.AssignmentRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.request.ChangeClassMemberStatusRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.request.CreateClassroomRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.request.JoinClassroomRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.service.ClassroomService;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.service.AssignmentService;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.service.MaterialService;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.service.LoginRateLimitService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

@RestController
@RequestMapping("/api/classrooms")
@RequiredArgsConstructor
public class ClassRoomController {
    private final ClassroomService classroomService;
    private final AssignmentService assignmentService;
    private final MaterialService materialService;
    private final LoginRateLimitService rateLimitService;

    @GetMapping("/{classroomId}/materials")
    @PreAuthorize("hasAnyRole('TEACHER', 'USER')")
    public ResponseEntity<ApiResponse<List<MaterialResponse>>> getMaterials(
            @AuthenticationPrincipal User currentUser, @PathVariable String classroomId) {
        return ResponseEntity.ok(ApiResponse.success(materialService.list(currentUser, classroomId)));
    }

    @PostMapping(value = "/{classroomId}/materials", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<MaterialResponse>> uploadMaterial(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String classroomId,
            @RequestParam("title") String title,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        rateLimitService.checkAllowed("class-pdf-upload", clientIp, currentUser.getId(), 30, 10);
        rateLimitService.recordAttempt("class-pdf-upload", clientIp, currentUser.getId(), 30, 10);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Tải tài liệu lớp thành công",
                materialService.upload(currentUser, classroomId, title, file)));
    }

    @GetMapping("/{classroomId}/materials/{materialId}/download")
    @PreAuthorize("hasAnyRole('TEACHER', 'USER')")
    public ResponseEntity<ApiResponse<MaterialDownloadResponse>> createMaterialDownloadLink(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String classroomId,
            @PathVariable String materialId) {
        return ResponseEntity.ok(ApiResponse.success(
                materialService.createDownloadLink(currentUser, classroomId, materialId)));
    }

    @DeleteMapping("/{classroomId}/materials/{materialId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<Void>> hideMaterial(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String classroomId,
            @PathVariable String materialId) {
        materialService.hide(currentUser, classroomId, materialId);
        return ResponseEntity.ok(ApiResponse.success("Đã ẩn tài liệu khỏi lớp"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ClassroomResponse>> createClassroom(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateClassroomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Tạo lớp học thành công", classroomService.createClassroom(currentUser, request)));
    }

    @PutMapping("/{classroomId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<ClassroomResponse>> updateClassroom(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String classroomId,
            @Valid @RequestBody CreateClassroomRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật lớp học thành công",
                classroomService.updateClassroom(currentUser, classroomId, request)));
    }

    @PostMapping("/{classroomId}/join-code/rotate")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<ClassroomResponse>> rotateJoinCode(
            @AuthenticationPrincipal User currentUser, @PathVariable String classroomId) {
        return ResponseEntity.ok(ApiResponse.success("Đã đổi mã tham gia; mã cũ không còn hiệu lực",
                classroomService.rotateJoinCode(currentUser, classroomId)));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<ClassroomResponse>>> getMyClassrooms(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(classroomService.getMyClassrooms(currentUser)));
    }

    @PostMapping("/join")
    public ResponseEntity<ApiResponse<ClassroomResponse>> joinClassroom(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody JoinClassroomRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Yêu cầu tham gia lớp đã được ghi nhận",
                classroomService.joinClassroom(currentUser, request)));
    }

    @GetMapping("/{classroomId}/members")
    public ResponseEntity<ApiResponse<List<ClassMemberResponse>>> getMembers(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String classroomId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(
                classroomService.getMembers(currentUser, classroomId, status)));
    }

    @PatchMapping("/{classroomId}/members/{memberId}")
    public ResponseEntity<ApiResponse<ClassMemberResponse>> changeMemberStatus(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String classroomId,
            @PathVariable String memberId,
            @Valid @RequestBody ChangeClassMemberStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành viên thành công",
                classroomService.changeMemberStatus(currentUser, classroomId, memberId, request)));
    }

    @PostMapping("/{classroomId}/assignments")
    public ResponseEntity<ApiResponse<AssignmentResponse>> createAssignment(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String classroomId,
            @Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Giao bài tập thành công",
                assignmentService.create(currentUser, classroomId, request)));
    }

    @GetMapping("/{classroomId}/assignments")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getClassAssignments(
            @AuthenticationPrincipal User currentUser, @PathVariable String classroomId) {
        return ResponseEntity.ok(ApiResponse.success(
                assignmentService.getClassAssignments(currentUser, classroomId)));
    }

    @PatchMapping("/assignments/{assignmentId}")
    public ResponseEntity<ApiResponse<AssignmentResponse>> updateAssignment(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String assignmentId,
            @Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật bài tập thành công",
                assignmentService.update(currentUser, assignmentId, request)));
    }

    @DeleteMapping("/assignments/{assignmentId}")
    public ResponseEntity<ApiResponse<Void>> archiveAssignment(
            @AuthenticationPrincipal User currentUser, @PathVariable String assignmentId) {
        assignmentService.archive(currentUser, assignmentId);
        return ResponseEntity.ok(ApiResponse.success("Đã ẩn bài tập; kết quả đã nộp được giữ lại"));
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<ApiResponse<List<AssignmentSubmissionResponse>>> getAssignmentSubmissions(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String assignmentId,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getSubmissions(
                currentUser, assignmentId, sortBy, direction)));
    }

    @GetMapping("/assignments/{assignmentId}/summary")
    public ResponseEntity<ApiResponse<AssignmentSummaryResponse>> getAssignmentSummary(
            @AuthenticationPrincipal User currentUser, @PathVariable String assignmentId) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getSummary(currentUser, assignmentId)));
    }

    @PatchMapping("/assignments/submissions/{resultId}/feedback")
    public ResponseEntity<ApiResponse<String>> addAssignmentFeedback(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String resultId,
            @Valid @RequestBody AssignmentFeedbackRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã lưu nhận xét và thông báo học sinh",
                assignmentService.addFeedback(currentUser, resultId, request.getComment())));
    }
}
