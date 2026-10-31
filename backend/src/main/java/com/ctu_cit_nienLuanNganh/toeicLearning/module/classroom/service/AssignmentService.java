package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TestStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.service.AuditEventService;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Assignment;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.ClassMember;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Classroom;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Notification;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Test;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.TestResult;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.LatePolicy;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto.AssignmentResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto.AssignmentSummaryResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto.AssignmentSubmissionResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.request.AssignmentRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.AssignmentRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.ClassMemberRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.ClassroomRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.NotificationRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.TestRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.TestResultRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AssignmentService {
    private static final String ROLE_TEACHER = "ROLE_TEACHER";
    private static final String ROLE_USER = "ROLE_USER";
    private static final String APPROVED = "APPROVED";

    private final AssignmentRepository assignmentRepository;
    private final ClassroomRepository classroomRepository;
    private final ClassMemberRepository classMemberRepository;
    private final TestRepository testRepository;
    private final TestResultRepository testResultRepository;
    private final NotificationRepository notificationRepository;
    private final AuditEventService auditEventService;
    @Autowired
    private EntityManager entityManager;

    @Transactional
    public AssignmentResponse create(User teacher, String classroomId, AssignmentRequest request) {
        Classroom classroom = requireOwnedClassroom(teacher, classroomId);
        Test test = requireAssignableTest(request.getTestId(), classroom);
        Assignment assignment = Assignment.builder()
                .classroom(classroom)
                .test(test)
                .title(request.getTitle().trim())
                .instructions(normalizeText(request.getInstructions()))
                .deadline(request.getDeadline())
                .latePolicy(request.getLatePolicy())
                .isActive(true)
                .build();
        Assignment saved = assignmentRepository.save(assignment);
        auditEventService.record(teacher, "ASSIGNMENT_CREATED", "ASSIGNMENT", saved.getId(), "active=true; latePolicy=" + saved.getLatePolicy());
        notifyApprovedMembers(classroom, "Bài tập mới", "Lớp " + classroom.getClassName()
                + " được giao bài: " + saved.getTitle(), "ASSIGNMENT_CREATED");
        return toResponse(saved, null, false);
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
                    TestResult latest = owner ? null : latestResult(assignment.getId(), currentUser.getId());
                    return toResponse(assignment, latest, !owner);
                }).toList();
    }

    @Transactional
    public AssignmentResponse update(User teacher, String assignmentId, AssignmentRequest request) {
        Assignment assignment = requireOwnedAssignmentForUpdate(teacher, assignmentId);
        Test test = requireAssignableTest(request.getTestId(), assignment.getClassroom());
        List<TestResult> submitted = testResultRepository.findByAssignmentIdOrderByCreatedAtDesc(assignmentId);
        if (!submitted.isEmpty() && (assignment.getTest() == null
                || !Objects.equals(assignment.getTest().getId(), test.getId()))) {
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
        Assignment saved = assignmentRepository.save(assignment);
        auditEventService.record(teacher, "ASSIGNMENT_UPDATED", "ASSIGNMENT", saved.getId(),
                "deadline=" + previousDeadline + "->" + saved.getDeadline()
                        + "; latePolicy=" + previousPolicy + "->" + saved.getLatePolicy());
        if (deadlineChanged) {
            notifyApprovedMembers(saved.getClassroom(), "Hạn nộp được cập nhật",
                    "Bài " + saved.getTitle() + " có hạn nộp mới: " + saved.getDeadline(),
                    "ASSIGNMENT_DEADLINE_CHANGED");
        }
        return toResponse(saved, null, false);
    }

    @Transactional
    public void archive(User teacher, String assignmentId) {
        Assignment assignment = requireOwnedAssignmentForUpdate(teacher, assignmentId);
        boolean wasActive = Boolean.TRUE.equals(assignment.getIsActive());
        assignment.setIsActive(false);
        assignmentRepository.save(assignment);
        if (wasActive) auditEventService.record(teacher, "ASSIGNMENT_ARCHIVED", "ASSIGNMENT", assignment.getId(), "active=true->false");
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

        Map<String, TestResult> latestByStudent = new LinkedHashMap<>();
        for (TestResult result : testResultRepository.findByAssignmentIdOrderByCreatedAtDesc(assignmentId)) {
            if (result.getUser() != null) latestByStudent.putIfAbsent(result.getUser().getId(), result);
        }
        LocalDateTime now = LocalDateTime.now();
        List<AssignmentSubmissionResponse> rows = classMemberRepository
                .findByClassroom_IdAndStatusOrderByJoinedAtAsc(assignment.getClassroom().getId(), APPROVED)
                .stream().map(member -> toSubmission(member, latestByStudent.get(member.getStudent().getId()), assignment, now))
                .collect(java.util.stream.Collectors.toCollection(ArrayList::new));

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
            if (row.getResultId() != null) submitted++;
            if (Boolean.TRUE.equals(row.getLate())) late++;
            if ("MISSING".equals(row.getStatus())) missing++;
            if ("NOT_SUBMITTED".equals(row.getStatus())) notSubmitted++;
            if ("GRADED".equals(row.getStatus())) {
                reviewed++;
            }
        }
        if (!eligibleStudentIds.isEmpty()) {
            Object[] scoreSummary = testResultRepository.summarizeReviewedScores(assignmentId, eligibleStudentIds);
            scoreTotal = scoreSummary[0] == null ? 0L : ((Number) scoreSummary[0]).longValue();
            scoreCount = ((Number) scoreSummary[1]).intValue();
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
        // Refresh after acquiring the lock so deadline and late policy use the latest committed values.
        entityManager.refresh(assignment, LockModeType.PESSIMISTIC_WRITE);
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
                    .content("Bài " + assignment.getTitle() + " đã có nhận xét mới.")
                    .type("ASSIGNMENT_FEEDBACK")
                    .link("/results/" + result.getId())
                    .isRead(false)
                    .build());
        }
        return resultId;
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
        entityManager.refresh(assignment, LockModeType.PESSIMISTIC_WRITE);
        return assignment;
    }

    private Classroom requireOwnedClassroom(User teacher, String classroomId) {
        requireRole(teacher, ROLE_TEACHER);
        return classroomRepository.findById(classroomId)
                .filter(classroom -> classroom.getTeacher().getId().equals(teacher.getId()))
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    private Test requirePublishedTest(String testId) {
        return testRepository.findById(testId)
                .filter(test -> test.getStatus() == TestStatus.PUBLISHED && test.getClassroom() == null
                        && !Boolean.TRUE.equals(test.getIsVip()))
                .orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
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

    private TestResult latestResult(String assignmentId, String studentId) {
        List<TestResult> results = testResultRepository
                .findByAssignmentIdAndUserIdOrderByCreatedAtDesc(assignmentId, studentId);
        return results.isEmpty() ? null : results.get(0);
    }

    private AssignmentResponse toResponse(Assignment assignment, TestResult latest, boolean includeSubmission) {
        LocalDateTime submittedAt = latest == null ? null : latest.getCreatedAt();
        LocalDateTime deadlineSnapshot = latest == null ? null : latest.getAssignmentDeadlineSnapshot();
        if (deadlineSnapshot == null && latest != null && latest.getAssignment() != null) {
            deadlineSnapshot = latest.getAssignment().getDeadline();
        }
        boolean late = latest != null && (latest.getAssignmentLate() != null
                ? latest.getAssignmentLate()
                : submittedAt != null && deadlineSnapshot != null && submittedAt.isAfter(deadlineSnapshot));
        String status = latest == null ? (LocalDateTime.now().isAfter(assignment.getDeadline()) ? "MISSING" : "NOT_SUBMITTED")
                : (latest.getTeacherComment() != null && !latest.getTeacherComment().isBlank() ? "GRADED" : late ? "LATE" : "SUBMITTED");
        return AssignmentResponse.builder()
                .id(assignment.getId()).classroomId(assignment.getClassroom().getId())
                .title(assignment.getTitle()).instructions(assignment.getInstructions())
                .testId(assignment.getTest() == null ? null : assignment.getTest().getId())
                .testTitle(assignment.getTest() == null ? null : assignment.getTest().getTitleTest())
                .deadline(assignment.getDeadline()).latePolicy(assignment.getLatePolicy())
                .active(assignment.getIsActive())
                .myLatestResultId(includeSubmission && latest != null ? latest.getId() : null)
                .mySubmissionStatus(includeSubmission ? status : null)
                .myLatestSubmissionLate(includeSubmission && latest != null ? late : null)
                .myLatestSubmittedAt(includeSubmission ? submittedAt : null)
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

    private void notifyApprovedMembers(Classroom classroom, String title, String content, String type) {
        List<Notification> notifications = new ArrayList<>();
        for (ClassMember member : classMemberRepository
                .findByClassroom_IdAndStatusOrderByJoinedAtAsc(classroom.getId(), APPROVED)) {
            notifications.add(Notification.builder().user(member.getStudent()).title(title)
                    .content(content).type(type).link("/classrooms").isRead(false).build());
        }
        if (!notifications.isEmpty()) notificationRepository.saveAll(notifications);
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
