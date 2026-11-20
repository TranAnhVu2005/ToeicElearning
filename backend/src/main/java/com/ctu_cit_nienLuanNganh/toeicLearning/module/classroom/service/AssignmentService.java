package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TestStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.service.AuditEventService;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.service.CloudinaryService;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Assignment;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.AssignmentSubmission;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.ClassMember;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Classroom;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Material;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Notification;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Test;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.TestResult;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.LatePolicy;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto.AssignmentResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto.AssignmentSummaryResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto.AssignmentSubmissionResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto.MaterialDownloadResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.request.AssignmentRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.AssignmentRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.AssignmentSubmissionRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.ClassMemberRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.ClassroomRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.ExamSessionRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.MaterialRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.NotificationRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.TestRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.TestResultRepository;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AssignmentService {
    private static final String ROLE_TEACHER = "ROLE_TEACHER";
    private static final String ROLE_USER = "ROLE_USER";
    private static final String APPROVED = "APPROVED";
    private static final String CONTENT_TYPE_PDF = "application/pdf";
    private static final DateTimeFormatter DEADLINE_FMT = DateTimeFormatter.ofPattern("HH:mm 'ngày' dd/MM/yyyy");

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final ClassroomRepository classroomRepository;
    private final ClassMemberRepository classMemberRepository;
    private final ExamSessionRepository examSessionRepository;
    private final MaterialRepository materialRepository;
    private final TestRepository testRepository;
    private final TestResultRepository testResultRepository;
    private final NotificationRepository notificationRepository;
    private final AuditEventService auditEventService;
    private final ClassroomEmailService classroomEmailService;
    private final CloudinaryService cloudinaryService;
    @Autowired
    private EntityManager entityManager;

    @Transactional
    public AssignmentResponse create(User teacher, String classroomId, AssignmentRequest request) {
        Classroom classroom = requireOwnedClassroom(teacher, classroomId);
        String testId = normalizeText(request.getTestId());
        String materialId = normalizeText(request.getMaterialId());
        if (testId == null && materialId == null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        Test test = testId == null ? null : requireAssignableTest(testId, classroom);
        Material material = materialId == null ? null : requireAssignableMaterial(materialId, classroom);
        Assignment assignment = Assignment.builder()
                .classroom(classroom)
                .test(test)
                .material(material)
                .title(request.getTitle().trim())
                .instructions(normalizeText(request.getInstructions()))
                .deadline(request.getDeadline())
                .latePolicy(request.getLatePolicy())
                .isActive(true)
                .build();
        Assignment saved = assignmentRepository.save(assignment);
        auditEventService.record(teacher, "ASSIGNMENT_CREATED", "ASSIGNMENT", saved.getId(),
                "active=true; latePolicy=" + saved.getLatePolicy()
                        + "; type=" + (test != null ? "TEST" : "PDF"));
        String formattedDeadline = saved.getDeadline() != null ? saved.getDeadline().format(DEADLINE_FMT) : "Chưa đặt";
        List<User> approvedStudents = notifyApprovedMembers(classroom, "Bài tập mới trong lớp " + classroom.getClassName(),
                "Giáo viên " + teacher.getUserName() + " vừa giao bài tập \"" + saved.getTitle()
                        + "\" (Hạn nộp: " + formattedDeadline + ").",
                "ASSIGNMENT_CREATED");
        classroomEmailService.sendNewAssignmentEmails(classroom, saved, teacher, approvedStudents);
        return toResponse(saved, null, null, false);
    }

    @Transactional
    public List<AssignmentResponse> getClassAssignments(User currentUser, String classroomId) {
        Classroom classroom;
        boolean owner = ROLE_TEACHER.equals(roleName(currentUser));
        if (owner) {
            classroom = requireOwnedClassroom(currentUser, classroomId);
        } else {
            requireRole(currentUser, ROLE_USER);
            ClassMember membership = classMemberRepository
                    .findByClassroom_IdAndStudent_Id(classroomId, currentUser.getId())
                    .filter(member -> APPROVED.equals(member.getStatus()))
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
            classroom = membership.getClassroom();
        }

        return assignmentRepository.findByClassroom_IdAndIsActiveTrueOrderByDeadlineAsc(classroom.getId())
                .stream().map(assignment -> {
                    TestResult latest = (!owner && assignment.getTest() != null)
                            ? latestResult(assignment.getId(), currentUser.getId())
                            : null;
                    AssignmentSubmission latestPdf = (!owner && assignment.getTest() == null)
                            ? latestPdfSubmission(assignment.getId(), currentUser.getId())
                            : null;
                    return toResponse(assignment, latest, latestPdf, !owner);
                }).toList();
    }

    @Transactional
    public AssignmentResponse update(User teacher, String assignmentId, AssignmentRequest request) {
        Assignment assignment = requireOwnedAssignmentForUpdate(teacher, assignmentId);
        String testId = normalizeText(request.getTestId());
        String materialId = normalizeText(request.getMaterialId());
        if (testId == null && materialId == null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        Test test = testId == null ? null : requireAssignableTest(testId, assignment.getClassroom());
        Material material = materialId == null ? null : requireAssignableMaterial(materialId, assignment.getClassroom());
        List<TestResult> submitted = testResultRepository.findByAssignmentIdOrderByCreatedAtDesc(assignmentId);
        String oldTestId = assignment.getTest() == null ? null : assignment.getTest().getId();
        String newTestId = test == null ? null : test.getId();
        if (!submitted.isEmpty() && !Objects.equals(oldTestId, newTestId)) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION);
        }
        List<AssignmentSubmission> submittedPdfs = assignmentSubmissionRepository
                .findByAssignment_IdOrderByCreatedAtDesc(assignmentId);
        if (!submittedPdfs.isEmpty() && newTestId != null) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION);
        }
        var previousDeadline = assignment.getDeadline();
        var previousPolicy = assignment.getLatePolicy();
        boolean deadlineChanged = !Objects.equals(previousDeadline, request.getDeadline());
        assignment.setTitle(request.getTitle().trim());
        assignment.setInstructions(normalizeText(request.getInstructions()));
        assignment.setDeadline(request.getDeadline());
        assignment.setLatePolicy(request.getLatePolicy());
        assignment.setTest(test);
        assignment.setMaterial(material);
        Assignment saved = assignmentRepository.save(assignment);
        auditEventService.record(teacher, "ASSIGNMENT_UPDATED", "ASSIGNMENT", saved.getId(),
                "deadline=" + previousDeadline + "->" + saved.getDeadline()
                        + "; latePolicy=" + previousPolicy + "->" + saved.getLatePolicy());
        if (deadlineChanged) {
            String formattedDeadline = saved.getDeadline() != null ? saved.getDeadline().format(DEADLINE_FMT) : "Chưa đặt";
            List<User> approvedStudents = notifyApprovedMembers(saved.getClassroom(), "Cập nhật hạn nộp bài tập",
                    "Bài tập \"" + saved.getTitle() + "\" trong lớp \"" + saved.getClassroom().getClassName()
                            + "\" được cập nhật hạn nộp mới: " + formattedDeadline + ".",
                    "ASSIGNMENT_DEADLINE_CHANGED");
            classroomEmailService.sendDeadlineUpdatedEmails(saved.getClassroom(), saved, teacher, approvedStudents);
        }
        return toResponse(saved, null, null, false);
    }

    @Transactional
    public void archive(User teacher, String assignmentId) {
        Assignment assignment = requireOwnedAssignmentForUpdate(teacher, assignmentId);
        List<String> cloudinaryPublicIdsToDelete = new ArrayList<>();

        List<AssignmentSubmission> pdfSubmissions = assignmentSubmissionRepository
                .findByAssignment_IdOrderByCreatedAtDesc(assignmentId);
        for (AssignmentSubmission sub : pdfSubmissions) {
            if (sub.getCloudinaryPublicId() != null && !sub.getCloudinaryPublicId().isBlank()) {
                cloudinaryPublicIdsToDelete.add(sub.getCloudinaryPublicId());
            }
        }

        Material attachedMaterial = assignment.getMaterial();
        Material materialToDelete = null;
        if (attachedMaterial != null
                && Boolean.TRUE.equals(attachedMaterial.getAssignmentAttachment())
                && !assignmentRepository.existsByMaterial_IdAndIdNot(attachedMaterial.getId(), assignmentId)) {
            materialToDelete = attachedMaterial;
            if (attachedMaterial.getCloudinaryPublicId() != null && !attachedMaterial.getCloudinaryPublicId().isBlank()) {
                cloudinaryPublicIdsToDelete.add(attachedMaterial.getCloudinaryPublicId());
            }
        }

        testResultRepository.detachAssignment(assignmentId);
        examSessionRepository.detachAssignment(assignmentId);
        if (!pdfSubmissions.isEmpty()) {
            assignmentSubmissionRepository.deleteAll(pdfSubmissions);
        }
        assignmentRepository.delete(assignment);
        if (materialToDelete != null) {
            materialRepository.delete(materialToDelete);
        }
        assignmentRepository.flush();

        for (String publicId : cloudinaryPublicIdsToDelete) {
            cloudinaryService.deletePrivateClassPdfQuietly(publicId);
        }
        auditEventService.record(teacher, "ASSIGNMENT_DELETED", "ASSIGNMENT", assignmentId,
                "deleted=true; cleanedPdfCount=" + cloudinaryPublicIdsToDelete.size());
    }

    @Transactional
    public List<AssignmentSubmissionResponse> getSubmissions(User teacher, String assignmentId,
                                                               String sortBy, String direction) {
        Assignment assignment = requireOwnedAssignment(teacher, assignmentId);
        String sort = sortBy == null || sortBy.isBlank() ? "name" : sortBy.trim().toLowerCase(Locale.ROOT);
        if (!List.of("name", "score").contains(sort)) throw new AppException(ErrorCode.VALIDATION_ERROR);
        boolean descending = "DESC".equalsIgnoreCase(direction);
        if (direction != null && !direction.isBlank() && !List.of("ASC", "DESC").contains(direction.toUpperCase(Locale.ROOT))) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }

        LocalDateTime now = LocalDateTime.now();
        List<AssignmentSubmissionResponse> rows;
        if (assignment.getTest() == null) {
            Map<String, AssignmentSubmission> latestPdfByStudent = new LinkedHashMap<>();
            for (AssignmentSubmission sub : assignmentSubmissionRepository.findByAssignment_IdOrderByCreatedAtDesc(assignmentId)) {
                if (sub.getStudent() != null) latestPdfByStudent.putIfAbsent(sub.getStudent().getId(), sub);
            }
            rows = classMemberRepository
                    .findByClassroom_IdAndStatusOrderByJoinedAtAsc(assignment.getClassroom().getId(), APPROVED)
                    .stream().map(member -> toPdfSubmission(member, latestPdfByStudent.get(member.getStudent().getId()), assignment, now))
                    .collect(java.util.stream.Collectors.toCollection(ArrayList::new));
        } else {
            Map<String, TestResult> latestByStudent = new LinkedHashMap<>();
            for (TestResult result : testResultRepository.findByAssignmentIdOrderByCreatedAtDesc(assignmentId)) {
                if (result.getUser() != null) latestByStudent.putIfAbsent(result.getUser().getId(), result);
            }
            rows = classMemberRepository
                    .findByClassroom_IdAndStatusOrderByJoinedAtAsc(assignment.getClassroom().getId(), APPROVED)
                    .stream().map(member -> toSubmission(member, latestByStudent.get(member.getStudent().getId()), assignment, now))
                    .collect(java.util.stream.Collectors.toCollection(ArrayList::new));
        }

        Comparator<AssignmentSubmissionResponse> comparator;
        if (sort.equals("score")) {
            Comparator<Integer> scoreOrder = descending
                    ? Comparator.nullsLast(Comparator.<Integer>reverseOrder())
                    : Comparator.nullsLast(Comparator.<Integer>naturalOrder());
            comparator = Comparator.comparing(AssignmentSubmissionResponse::getScore, scoreOrder)
                    .thenComparing(AssignmentSubmissionResponse::getStudentName, String.CASE_INSENSITIVE_ORDER);
        } else {
            comparator = Comparator.comparing(AssignmentSubmissionResponse::getStudentName, String.CASE_INSENSITIVE_ORDER);
            if (descending) comparator = comparator.reversed();
        }
        rows.sort(comparator);
        return rows;
    }

    @Transactional
    public AssignmentSummaryResponse getSummary(User teacher, String assignmentId) {
        Assignment assignment = requireOwnedAssignment(teacher, assignmentId);
        List<AssignmentSubmissionResponse> rows = getSubmissions(teacher, assignmentId, "name", "ASC");
        int submitted = 0;
        int late = 0;
        int missing = 0;
        int notSubmitted = 0;
        int reviewed = 0;
        long scoreTotal = 0;
        int scoreCount = 0;
        Set<String> eligibleStudentIds = rows.stream().map(AssignmentSubmissionResponse::getStudentId)
                .filter(Objects::nonNull).collect(java.util.stream.Collectors.toSet());
        for (AssignmentSubmissionResponse row : rows) {
            if (row.getResultId() != null || row.getPdfSubmissionId() != null) submitted++;
            if (Boolean.TRUE.equals(row.getLate())) late++;
            if ("MISSING".equals(row.getStatus())) missing++;
            if ("NOT_SUBMITTED".equals(row.getStatus())) notSubmitted++;
            if ("GRADED".equals(row.getStatus())) {
                reviewed++;
            }
            if (assignment.getTest() == null && row.getScore() != null) {
                scoreTotal += row.getScore();
                scoreCount++;
            }
        }
        if (assignment.getTest() != null && !eligibleStudentIds.isEmpty()) {
            List<Object[]> scoreSummaryRows = testResultRepository.summarizeReviewedScores(assignmentId, eligibleStudentIds);
            Object[] scoreSummary = scoreSummaryRows.isEmpty() ? null : scoreSummaryRows.get(0);
            scoreTotal = scoreSummary == null || scoreSummary.length < 1 || scoreSummary[0] == null
                    ? 0L : ((Number) scoreSummary[0]).longValue();
            scoreCount = scoreSummary == null || scoreSummary.length < 2 || scoreSummary[1] == null
                    ? 0 : ((Number) scoreSummary[1]).intValue();
        }
        return AssignmentSummaryResponse.builder()
                .eligibleStudents(rows.size())
                .submittedCount(submitted)
                .lateCount(late)
                .missingCount(missing)
                .notSubmittedCount(notSubmitted)
                .reviewedCount(reviewed)
                .averageScore(scoreCount == 0 ? null : (double) scoreTotal / scoreCount)
                .averageScoreSubmissionCount(scoreCount)
                .build();
    }

    @Transactional
    public TestResult attachSubmission(User student, String assignmentId, String testId,
                                     TestResult result, LocalDateTime submittedAt) {
        requireRole(student, ROLE_USER);
        Assignment assignment = assignmentRepository.findByIdForUpdate(assignmentId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        // The assignment may already be managed from session validation earlier in this transaction.
        // Refresh after acquiring the native FOR UPDATE row lock so deadline and late policy use the latest committed values.
        entityManager.refresh(assignment);
        if (!Boolean.TRUE.equals(assignment.getIsActive())
                || assignment.getTest() == null || assignment.getTest().getStatus() != TestStatus.PUBLISHED
                || !assignment.getClassroom().getId().equals(
                    classMemberRepository.findForUpdateByClassroomAndStudent(
                            assignment.getClassroom().getId(), student.getId())
                            .filter(member -> APPROVED.equals(member.getStatus()))
                            .map(member -> member.getClassroom().getId())
                            .orElse(null))
                || assignment.getTest() == null || !assignment.getTest().getId().equals(testId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        if (assignment.getDeadline() == null || assignment.getLatePolicy() == null) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION);
        }
        boolean late = submittedAt.isAfter(assignment.getDeadline());
        if (late && assignment.getLatePolicy() == LatePolicy.REJECT_AFTER_DEADLINE) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        result.setAssignment(assignment);
        result.setAssignmentDeadlineSnapshot(assignment.getDeadline());
        result.setAssignmentLate(late);
        return result;
    }

    @Transactional
    public String addFeedback(User teacher, String resultId, String comment) {
        TestResult result = testResultRepository.findById(resultId)
                .orElseThrow(() -> new AppException(ErrorCode.TEST_RESULT_NOT_FOUND));
        Assignment assignment = result.getAssignment();
        if (assignment == null) throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        requireOwnedClassroom(teacher, assignment.getClassroom().getId());
        String normalized = comment == null ? "" : comment.trim();
        if (normalized.isBlank() || normalized.length() > 5000) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        boolean changed = !Objects.equals(result.getTeacherComment(), normalized);
        result.setTeacherComment(normalized);
        testResultRepository.save(result);
        if (changed) auditEventService.record(teacher, "ASSIGNMENT_FEEDBACK_UPDATED", "TEST_RESULT", result.getId(), "feedback=updated");
        boolean recipientIsApproved = result.getUser() != null && classMemberRepository
                .findByClassroom_IdAndStudent_Id(assignment.getClassroom().getId(), result.getUser().getId())
                .filter(member -> APPROVED.equals(member.getStatus()))
                .isPresent();
        if (changed && recipientIsApproved) {
            notificationRepository.save(Notification.builder()
                    .user(result.getUser())
                    .title("Giáo viên đã nhận xét bài tập")
                    .content("Giáo viên " + teacher.getUserName() + " đã chấm và gửi nhận xét cho bài tập \""
                            + assignment.getTitle() + "\" trong lớp \"" + assignment.getClassroom().getClassName() + "\".")
                    .type("ASSIGNMENT_FEEDBACK")
                    .link("/results/" + result.getId())
                    .isRead(false)
                    .build());
        }
        return resultId;
    }

    @Transactional
    public AssignmentResponse submitPdfAssignment(User student, String assignmentId, MultipartFile file, String note) {
        requireRole(student, ROLE_USER);
        Assignment assignment = assignmentRepository.findByIdForUpdate(assignmentId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        entityManager.refresh(assignment);
        if (!Boolean.TRUE.equals(assignment.getIsActive())
                || assignment.getTest() != null
                || assignment.getMaterial() == null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        boolean isApprovedMember = classMemberRepository
                .findForUpdateByClassroomAndStudent(assignment.getClassroom().getId(), student.getId())
                .filter(member -> APPROVED.equals(member.getStatus()))
                .isPresent();
        if (!isApprovedMember) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        if (assignment.getDeadline() == null || assignment.getLatePolicy() == null) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION);
        }
        LocalDateTime submittedAt = LocalDateTime.now();
        boolean late = submittedAt.isAfter(assignment.getDeadline());
        if (late && assignment.getLatePolicy() == LatePolicy.REJECT_AFTER_DEADLINE) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        String normalizedNote = normalizeText(note);
        if (normalizedNote != null && normalizedNote.length() > 2000) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }

        String folder = "Resource/toeic-learning/classrooms/" + assignment.getClassroom().getId()
                + "/submissions/" + assignment.getId();
        CloudinaryService.PrivatePdfUpload uploadedFile = cloudinaryService.uploadPrivateClassPdf(file, folder);
        AssignmentSubmission submission = AssignmentSubmission.builder()
                .assignment(assignment)
                .student(student)
                .fileUrl(uploadedFile.secureUrl())
                .cloudinaryPublicId(uploadedFile.publicId())
                .fileFormat("pdf")
                .originalFileName(uploadedFile.originalFileName())
                .contentType(CONTENT_TYPE_PDF)
                .sizeBytes(uploadedFile.sizeBytes())
                .studentNote(normalizedNote)
                .deadlineSnapshot(assignment.getDeadline())
                .late(late)
                .build();
        try {
            List<AssignmentSubmission> previousSubmissions = assignmentSubmissionRepository
                    .findByAssignment_IdAndStudent_IdOrderByCreatedAtDesc(assignment.getId(), student.getId());
            AssignmentSubmission saved = assignmentSubmissionRepository.save(submission);
            if (!previousSubmissions.isEmpty()) {
                List<String> oldPublicIds = previousSubmissions.stream()
                        .map(AssignmentSubmission::getCloudinaryPublicId)
                        .filter(id -> id != null && !id.isBlank())
                        .toList();
                assignmentSubmissionRepository.deleteAll(previousSubmissions);
                assignmentSubmissionRepository.flush();
                for (String oldPublicId : oldPublicIds) {
                    cloudinaryService.deletePrivateClassPdfQuietly(oldPublicId);
                }
            }
            auditEventService.record(student, "ASSIGNMENT_PDF_SUBMITTED", "ASSIGNMENT_SUBMISSION", saved.getId(),
                    "assignmentId=" + assignment.getId() + "; late=" + late);
            if (assignment.getClassroom().getTeacher() != null) {
                notificationRepository.save(Notification.builder()
                        .user(assignment.getClassroom().getTeacher())
                        .title("Học viên vừa nộp bài tập PDF")
                        .content("Học viên " + student.getUserName() + " vừa nộp bài PDF cho bài tập \""
                                + assignment.getTitle() + "\" trong lớp \"" + assignment.getClassroom().getClassName() + "\".")
                        .type("ASSIGNMENT_PDF_SUBMITTED")
                        .link("/classrooms")
                        .isRead(false)
                        .build());
            }
            return toResponse(assignment, null, saved, true);
        } catch (RuntimeException exception) {
            cloudinaryService.deletePrivateClassPdf(uploadedFile.publicId());
            throw exception;
        }
    }

    @Transactional
    public MaterialDownloadResponse createPdfSubmissionDownloadLink(
            User currentUser, String submissionId, boolean attachment) {
        AssignmentSubmission submission = requirePdfSubmissionAccess(currentUser, submissionId);
        if (submission.getCloudinaryPublicId() == null || submission.getFileFormat() == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }
        CloudinaryService.PrivateDownload download = cloudinaryService.createPrivateRawDownload(
                submission.getCloudinaryPublicId(), submission.getFileFormat(), attachment);
        return new MaterialDownloadResponse(download.url(), Instant.ofEpochSecond(download.expiresAt()));
    }

    @Transactional
    public MaterialService.MaterialPreviewContent loadPdfSubmissionPreviewContent(
            User currentUser, String submissionId) {
        AssignmentSubmission submission = requirePdfSubmissionAccess(currentUser, submissionId);
        if (submission.getCloudinaryPublicId() == null || submission.getFileFormat() == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }
        CloudinaryService.PrivateDownload download = cloudinaryService.createPrivateRawDownload(
                submission.getCloudinaryPublicId(), submission.getFileFormat(), false);
        URI uri = URI.create(download.url());
        String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase();
        if (!"https".equalsIgnoreCase(uri.getScheme())
                || !(host.equals("api.cloudinary.com") || host.equals("res.cloudinary.com"))) {
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }
        try {
            HttpClient client = HttpClient.newBuilder()
                    .followRedirects(HttpClient.Redirect.NORMAL)
                    .connectTimeout(Duration.ofSeconds(15))
                    .build();
            HttpRequest request = HttpRequest.newBuilder(uri)
                    .timeout(Duration.ofSeconds(30))
                    .GET()
                    .build();
            HttpResponse<byte[]> response = client.send(request, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() < 200 || response.statusCode() >= 300 || response.body() == null) {
                throw new AppException(ErrorCode.FILE_NOT_FOUND);
            }
            String fileName = submission.getOriginalFileName() != null && !submission.getOriginalFileName().isBlank()
                    ? submission.getOriginalFileName()
                    : "Bai-nop.pdf";
            return new MaterialService.MaterialPreviewContent(response.body(), fileName);
        } catch (AppException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }
    }

    @Transactional
    public String gradePdfSubmission(User teacher, String submissionId, Integer score, String comment) {
        AssignmentSubmission submission = assignmentSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        Assignment assignment = submission.getAssignment();
        if (assignment == null) throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        requireOwnedClassroom(teacher, assignment.getClassroom().getId());
        String normalized = comment == null ? "" : comment.trim();
        if (normalized.isBlank() || normalized.length() > 5000) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        if (score != null && (score < 0 || score > 990)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        boolean changed = !Objects.equals(submission.getTeacherComment(), normalized)
                || !Objects.equals(submission.getScore(), score);
        submission.setScore(score);
        submission.setTeacherComment(normalized);
        assignmentSubmissionRepository.save(submission);
        if (changed) {
            auditEventService.record(teacher, "ASSIGNMENT_PDF_FEEDBACK_UPDATED", "ASSIGNMENT_SUBMISSION",
                    submission.getId(), "score=" + score + "; feedback=updated");
        }
        boolean recipientIsApproved = submission.getStudent() != null && classMemberRepository
                .findByClassroom_IdAndStudent_Id(assignment.getClassroom().getId(), submission.getStudent().getId())
                .filter(member -> APPROVED.equals(member.getStatus()))
                .isPresent();
        if (changed && recipientIsApproved) {
            String scoreNote = score != null ? " (Điểm: " + score + ")" : "";
            notificationRepository.save(Notification.builder()
                    .user(submission.getStudent())
                    .title("Giáo viên đã chấm bài tập PDF")
                    .content("Giáo viên " + teacher.getUserName() + " đã chấm và nhận xét bài tập \""
                            + assignment.getTitle() + "\"" + scoreNote + " trong lớp \""
                            + assignment.getClassroom().getClassName() + "\".")
                    .type("ASSIGNMENT_FEEDBACK")
                    .link("/classrooms")
                    .isRead(false)
                    .build());
        }
        return submissionId;
    }

    private AssignmentSubmission requirePdfSubmissionAccess(User currentUser, String submissionId) {
        AssignmentSubmission submission = assignmentSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        Assignment assignment = submission.getAssignment();
        if (assignment == null || assignment.getClassroom() == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }
        Classroom classroom = assignment.getClassroom();
        String role = roleName(currentUser);
        if (ROLE_TEACHER.equals(role) && classroom.getTeacher().getId().equals(currentUser.getId())) {
            return submission;
        }
        if (ROLE_USER.equals(role)
                && submission.getStudent() != null
                && submission.getStudent().getId().equals(currentUser.getId())) {
            boolean approved = classMemberRepository
                    .findByClassroom_IdAndStudent_Id(classroom.getId(), currentUser.getId())
                    .filter(member -> APPROVED.equals(member.getStatus()))
                    .isPresent();
            if (approved) return submission;
        }
        throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
    }

    private Assignment requireOwnedAssignment(User teacher, String assignmentId) {
        requireRole(teacher, ROLE_TEACHER);
        return assignmentRepository.findById(assignmentId)
                .filter(assignment -> assignment.getClassroom().getTeacher().getId().equals(teacher.getId()))
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    private Assignment requireOwnedAssignmentForUpdate(User teacher, String assignmentId) {
        requireRole(teacher, ROLE_TEACHER);
        Assignment assignment = assignmentRepository.findByIdForUpdate(assignmentId)
                .filter(candidate -> candidate.getClassroom().getTeacher().getId().equals(teacher.getId()))
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        entityManager.refresh(assignment);
        return assignment;
    }

    private Classroom requireOwnedClassroom(User teacher, String classroomId) {
        requireRole(teacher, ROLE_TEACHER);
        return classroomRepository.findById(classroomId)
                .filter(classroom -> classroom.getTeacher().getId().equals(teacher.getId()))
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    private Test requireAssignableTest(String testId, Classroom classroom) {
        Test test = testRepository.findById(testId)
                .filter(candidate -> candidate.getStatus() == TestStatus.PUBLISHED
                        && !Boolean.TRUE.equals(candidate.getIsVip()))
                .orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
        if (test.getClassroom() != null && (!test.getClassroom().getId().equals(classroom.getId())
                || test.getOwnerTeacher() == null
                || !test.getOwnerTeacher().getId().equals(classroom.getTeacher().getId()))) {
            throw new AppException(ErrorCode.TEST_NOT_FOUND);
        }
        return test;
    }

    private Material requireAssignableMaterial(String materialId, Classroom classroom) {
        return materialRepository.findByIdAndClassroom_IdAndActiveTrue(materialId, classroom.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    private TestResult latestResult(String assignmentId, String studentId) {
        List<TestResult> results = testResultRepository
                .findByAssignmentIdAndUserIdOrderByCreatedAtDesc(assignmentId, studentId);
        return results.isEmpty() ? null : results.get(0);
    }

    private AssignmentSubmission latestPdfSubmission(String assignmentId, String studentId) {
        List<AssignmentSubmission> submissions = assignmentSubmissionRepository
                .findByAssignment_IdAndStudent_IdOrderByCreatedAtDesc(assignmentId, studentId);
        return submissions.isEmpty() ? null : submissions.get(0);
    }

    private AssignmentResponse toResponse(
            Assignment assignment,
            TestResult latest,
            AssignmentSubmission latestPdf,
            boolean includeSubmission) {
        boolean isPdfAssignment = assignment.getTest() == null;
        LocalDateTime submittedAt = null;
        boolean late = false;
        String status = null;
        Integer latestScore = null;
        String teacherComment = null;

        if (isPdfAssignment) {
            submittedAt = latestPdf == null ? null : latestPdf.getCreatedAt();
            LocalDateTime deadlineSnapshot = latestPdf == null ? null : latestPdf.getDeadlineSnapshot();
            if (deadlineSnapshot == null) deadlineSnapshot = assignment.getDeadline();
            late = latestPdf != null && (latestPdf.getLate() != null
                    ? latestPdf.getLate()
                    : submittedAt != null && deadlineSnapshot != null && submittedAt.isAfter(deadlineSnapshot));
            boolean graded = latestPdf != null
                    && ((latestPdf.getTeacherComment() != null && !latestPdf.getTeacherComment().isBlank())
                    || latestPdf.getScore() != null);
            status = latestPdf == null
                    ? (assignment.getDeadline() != null && LocalDateTime.now().isAfter(assignment.getDeadline())
                    ? "MISSING" : "NOT_SUBMITTED")
                    : (graded ? "GRADED" : late ? "LATE" : "SUBMITTED");
            latestScore = latestPdf == null ? null : latestPdf.getScore();
            teacherComment = latestPdf == null ? null : latestPdf.getTeacherComment();
        } else {
            submittedAt = latest == null ? null : latest.getCreatedAt();
            LocalDateTime deadlineSnapshot = latest == null ? null : latest.getAssignmentDeadlineSnapshot();
            if (deadlineSnapshot == null && latest != null && latest.getAssignment() != null) {
                deadlineSnapshot = latest.getAssignment().getDeadline();
            }
            late = latest != null && (latest.getAssignmentLate() != null
                    ? latest.getAssignmentLate()
                    : submittedAt != null && deadlineSnapshot != null && submittedAt.isAfter(deadlineSnapshot));
            status = latest == null
                    ? (assignment.getDeadline() != null && LocalDateTime.now().isAfter(assignment.getDeadline())
                    ? "MISSING" : "NOT_SUBMITTED")
                    : (latest.getTeacherComment() != null && !latest.getTeacherComment().isBlank()
                    ? "GRADED" : late ? "LATE" : "SUBMITTED");
            latestScore = latest == null ? null : latest.getTotalScore();
            teacherComment = latest == null ? null : latest.getTeacherComment();
        }

        Material material = assignment.getMaterial() != null && Boolean.TRUE.equals(assignment.getMaterial().getActive())
                ? assignment.getMaterial()
                : null;
        boolean hasAnySubmission = isPdfAssignment ? latestPdf != null : latest != null;
        return AssignmentResponse.builder()
                .id(assignment.getId()).classroomId(assignment.getClassroom().getId())
                .title(assignment.getTitle()).instructions(assignment.getInstructions())
                .testId(assignment.getTest() == null ? null : assignment.getTest().getId())
                .testTitle(assignment.getTest() == null ? null : assignment.getTest().getTitleTest())
                .materialId(material == null ? null : material.getId())
                .materialTitle(material == null ? null : material.getTitle())
                .materialFileName(material == null ? null : material.getOriginalFileName())
                .materialSizeBytes(material == null ? null : material.getSizeBytes())
                .materialDownloadable(material != null && material.getCloudinaryPublicId() != null && material.getFileFormat() != null)
                .deadline(assignment.getDeadline()).latePolicy(assignment.getLatePolicy())
                .active(assignment.getIsActive())
                .createdAt(assignment.getCreatedAt())
                .myLatestResultId(includeSubmission && latest != null ? latest.getId() : null)
                .myPdfSubmissionId(includeSubmission && latestPdf != null ? latestPdf.getId() : null)
                .myPdfSubmissionFileName(includeSubmission && latestPdf != null ? latestPdf.getOriginalFileName() : null)
                .myPdfSubmissionSizeBytes(includeSubmission && latestPdf != null ? latestPdf.getSizeBytes() : null)
                .myPdfSubmissionNote(includeSubmission && latestPdf != null ? latestPdf.getStudentNote() : null)
                .mySubmissionStatus(includeSubmission ? status : null)
                .myLatestSubmissionLate(includeSubmission && hasAnySubmission ? late : null)
                .myLatestSubmittedAt(includeSubmission ? submittedAt : null)
                .myLatestScore(includeSubmission ? latestScore : null)
                .myCorrectCount(includeSubmission && latest != null ? latest.getCorrectCount() : null)
                .myTotalCount(includeSubmission && latest != null ? latest.getTotalCount() : null)
                .myTeacherComment(includeSubmission ? teacherComment : null)
                .build();
    }

    private AssignmentSubmissionResponse toSubmission(ClassMember member, TestResult result,
                                                       Assignment assignment, LocalDateTime now) {
        if (result == null) {
            return AssignmentSubmissionResponse.builder()
                    .studentId(member.getStudent().getId()).studentName(member.getStudent().getUserName())
                    .studentEmail(member.getStudent().getUserEmail())
                    .status(now.isAfter(assignment.getDeadline()) ? "MISSING" : "NOT_SUBMITTED")
                    .late(false).build();
        }
        LocalDateTime deadline = result.getAssignmentDeadlineSnapshot() == null
                ? assignment.getDeadline() : result.getAssignmentDeadlineSnapshot();
        boolean late = result.getAssignmentLate() != null
                ? result.getAssignmentLate()
                : result.getCreatedAt() != null && result.getCreatedAt().isAfter(deadline);
        boolean graded = result.getTeacherComment() != null && !result.getTeacherComment().isBlank();
        return AssignmentSubmissionResponse.builder()
                .studentId(member.getStudent().getId()).studentName(member.getStudent().getUserName())
                .studentEmail(member.getStudent().getUserEmail())
                .status(graded ? "GRADED" : late ? "LATE" : "SUBMITTED").late(late)
                .resultId(result.getId()).score(result.getTotalScore()).correctCount(result.getCorrectCount())
                .totalCount(result.getTotalCount()).submittedAt(result.getCreatedAt())
                .teacherComment(result.getTeacherComment()).build();
    }

    private AssignmentSubmissionResponse toPdfSubmission(ClassMember member, AssignmentSubmission submission,
                                                          Assignment assignment, LocalDateTime now) {
        if (submission == null) {
            return AssignmentSubmissionResponse.builder()
                    .studentId(member.getStudent().getId()).studentName(member.getStudent().getUserName())
                    .studentEmail(member.getStudent().getUserEmail())
                    .status(assignment.getDeadline() != null && now.isAfter(assignment.getDeadline())
                            ? "MISSING" : "NOT_SUBMITTED")
                    .late(false).build();
        }
        LocalDateTime deadline = submission.getDeadlineSnapshot() == null
                ? assignment.getDeadline() : submission.getDeadlineSnapshot();
        boolean late = submission.getLate() != null
                ? submission.getLate()
                : submission.getCreatedAt() != null && deadline != null && submission.getCreatedAt().isAfter(deadline);
        boolean graded = (submission.getTeacherComment() != null && !submission.getTeacherComment().isBlank())
                || submission.getScore() != null;
        return AssignmentSubmissionResponse.builder()
                .studentId(member.getStudent().getId()).studentName(member.getStudent().getUserName())
                .studentEmail(member.getStudent().getUserEmail())
                .status(graded ? "GRADED" : late ? "LATE" : "SUBMITTED").late(late)
                .pdfSubmissionId(submission.getId())
                .pdfSubmissionFileName(submission.getOriginalFileName())
                .pdfSubmissionSizeBytes(submission.getSizeBytes())
                .studentNote(submission.getStudentNote())
                .score(submission.getScore())
                .submittedAt(submission.getCreatedAt())
                .teacherComment(submission.getTeacherComment()).build();
    }

    private List<User> notifyApprovedMembers(Classroom classroom, String title, String content, String type) {
        List<Notification> notifications = new ArrayList<>();
        List<User> students = new ArrayList<>();
        for (ClassMember member : classMemberRepository
                .findByClassroom_IdAndStatusOrderByJoinedAtAsc(classroom.getId(), APPROVED)) {
            if (member.getStudent() != null) {
                students.add(member.getStudent());
                notifications.add(Notification.builder().user(member.getStudent()).title(title)
                        .content(content).type(type).link("/classrooms").isRead(false).build());
            }
        }
        if (!notifications.isEmpty()) notificationRepository.saveAll(notifications);
        return students;
    }

    private String normalizeText(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String roleName(User user) {
        return user.getRole() == null ? "" : user.getRole().getRoleName();
    }

    private void requireRole(User user, String role) {
        if (!role.equals(roleName(user))) throw new AppException(ErrorCode.UNAUTHORIZED);
    }
}
