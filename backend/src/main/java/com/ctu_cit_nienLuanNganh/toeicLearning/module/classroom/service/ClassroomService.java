package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto.ClassMemberResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto.ClassroomResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.request.ChangeClassMemberStatusRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.request.CreateClassroomRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.request.JoinClassroomRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.service.AuditEventService;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.ClassMember;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Classroom;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.ClassMemberRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.ClassroomRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ClassroomService {
    private static final String ROLE_TEACHER = "ROLE_TEACHER";
    private static final String ROLE_USER = "ROLE_USER";
    private static final String PENDING = "PENDING";
    private static final String APPROVED = "APPROVED";
    private static final String BLOCKED = "BLOCKED";
    private static final String REMOVED = "REMOVED";
    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private final ClassroomRepository classroomRepository;
    private final ClassMemberRepository classMemberRepository;
    private final AuditEventService auditEventService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public ClassroomResponse createClassroom(User currentUser, CreateClassroomRequest request) {
        requireRole(currentUser, ROLE_TEACHER);
        String className = request.getClassName().trim();
        if (className.isBlank()) throw new AppException(ErrorCode.VALIDATION_ERROR);

        Classroom classroom = Classroom.builder()
                .className(className)
                .description(normalizeDescription(request.getDescription()))
                .classCode(generateUniqueCode())
                .teacher(currentUser)
                .build();
        Classroom saved = classroomRepository.save(classroom);
        auditEventService.record(currentUser, "CLASSROOM_CREATED", "CLASSROOM", saved.getId(), "status=ACTIVE");
        return toClassroomResponse(saved, "OWNED", true);
    }

    @Transactional
    public ClassroomResponse updateClassroom(User currentUser, String classroomId, CreateClassroomRequest request) {
        Classroom classroom = requireOwnedClassroomForUpdate(currentUser, classroomId);
        String className = request.getClassName().trim();
        if (className.isBlank()) throw new AppException(ErrorCode.VALIDATION_ERROR);

        classroom.setClassName(className);
        classroom.setDescription(normalizeDescription(request.getDescription()));
        Classroom saved = classroomRepository.save(classroom);
        auditEventService.record(currentUser, "CLASSROOM_UPDATED", "CLASSROOM", saved.getId(),
                "fields=className,description");
        return toClassroomResponse(saved, "OWNED", true);
    }

    @Transactional
    public ClassroomResponse rotateJoinCode(User currentUser, String classroomId) {
        Classroom classroom = requireOwnedClassroomForUpdate(currentUser, classroomId);
        classroom.setClassCode(generateUniqueCode());
        auditEventService.record(currentUser, "CLASSROOM_JOIN_CODE_ROTATED", "CLASSROOM", classroom.getId(), "joinCode=rotated");
        return toClassroomResponse(classroomRepository.save(classroom), "OWNED", true);
    }

    @Transactional
    public List<ClassroomResponse> getMyClassrooms(User currentUser) {
        String role = roleName(currentUser);
        if (ROLE_TEACHER.equals(role)) {
            return classroomRepository.findByTeacher_IdOrderByCreatedAtDesc(currentUser.getId()).stream()
                    .map(classroom -> toClassroomResponse(classroom, "OWNED", true)).toList();
        }
        requireRole(currentUser, ROLE_USER);
        return classMemberRepository.findByStudent_IdOrderByJoinedAtDesc(currentUser.getId()).stream()
                .filter(member -> !REMOVED.equals(member.getStatus()))
                .map(member -> toClassroomResponse(member.getClassroom(), member.getStatus(), false)).toList();
    }

    @Transactional
    public ClassroomResponse joinClassroom(User currentUser, JoinClassroomRequest request) {
        requireRole(currentUser, ROLE_USER);
        String code = request.getClassCode().trim().toUpperCase(Locale.ROOT);
        Classroom classroom = classroomRepository.findByClassCodeForUpdate(code)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        if (classroom.getTeacher().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }

        ClassMember existing = classMemberRepository
                .findByClassroom_IdAndStudent_Id(classroom.getId(), currentUser.getId()).orElse(null);
        if (existing != null) {
            if (BLOCKED.equals(existing.getStatus()) || REMOVED.equals(existing.getStatus())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
            return toClassroomResponse(classroom, existing.getStatus(), false);
        }

        ClassMember member = classMemberRepository.save(ClassMember.builder()
                .classroom(classroom)
                .student(currentUser)
                .status(PENDING)
                .build());
        auditEventService.record(currentUser, "CLASS_MEMBERSHIP_REQUESTED", "CLASS_MEMBERSHIP", member.getId(), "status=PENDING");
        return toClassroomResponse(classroom, PENDING, false);
    }

    @Transactional
    public List<ClassMemberResponse> getMembers(User currentUser, String classroomId, String status) {
        Classroom classroom = requireOwnedClassroom(currentUser, classroomId);
        List<ClassMember> members;
        if (status == null || status.isBlank()) {
            members = classMemberRepository.findByClassroom_IdOrderByJoinedAtAsc(classroom.getId());
        } else {
            String normalizedStatus = status.trim().toUpperCase(Locale.ROOT);
            if (!List.of(PENDING, APPROVED, BLOCKED, REMOVED).contains(normalizedStatus)) {
                throw new AppException(ErrorCode.VALIDATION_ERROR);
            }
            members = classMemberRepository.findByClassroom_IdAndStatusOrderByJoinedAtAsc(
                    classroom.getId(), normalizedStatus);
        }
        return members.stream().map(this::toMemberResponse).toList();
    }

    @Transactional
    public ClassMemberResponse changeMemberStatus(User currentUser, String classroomId, String memberId,
                                                   ChangeClassMemberStatusRequest request) {
        Classroom classroom = requireOwnedClassroom(currentUser, classroomId);
        ClassMember member = classMemberRepository.findOwnedForUpdate(memberId, classroom.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        String previousStatus = member.getStatus();
        member.setStatus(request.getStatus());
        if (!previousStatus.equals(request.getStatus())) {
            auditEventService.record(currentUser, "CLASS_MEMBERSHIP_STATUS_CHANGED", "CLASS_MEMBERSHIP", member.getId(),
                    "status=" + previousStatus + "->" + request.getStatus());
        }
        return toMemberResponse(classMemberRepository.save(member));
    }

    private Classroom requireOwnedClassroom(User currentUser, String classroomId) {
        requireRole(currentUser, ROLE_TEACHER);
        return classroomRepository.findById(classroomId)
                .filter(classroom -> classroom.getTeacher().getId().equals(currentUser.getId()))
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    private Classroom requireOwnedClassroomForUpdate(User currentUser, String classroomId) {
        requireRole(currentUser, ROLE_TEACHER);
        return classroomRepository.findByIdForUpdate(classroomId)
                .filter(classroom -> classroom.getTeacher().getId().equals(currentUser.getId()))
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    private void requireRole(User user, String expectedRole) {
        if (!expectedRole.equals(roleName(user))) throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    private String roleName(User user) {
        return user.getRole() == null ? "" : user.getRole().getRoleName();
    }

    private String generateUniqueCode() {
        for (int attempt = 0; attempt < 8; attempt++) {
            StringBuilder code = new StringBuilder(8);
            for (int index = 0; index < 8; index++) {
                code.append(CODE_ALPHABET.charAt(secureRandom.nextInt(CODE_ALPHABET.length())));
            }
            if (!classroomRepository.existsByClassCode(code.toString())) return code.toString();
        }
        throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION);
    }

    private String normalizeDescription(String description) {
        if (description == null) return null;
        String normalized = description.trim();
        return normalized.isBlank() ? null : normalized;
    }

    private ClassroomResponse toClassroomResponse(Classroom classroom, String status, boolean includeCode) {
        return ClassroomResponse.builder()
                .id(classroom.getId())
                .className(classroom.getClassName())
                .description(classroom.getDescription())
                .classCode(includeCode ? classroom.getClassCode() : null)
                .teacherName(classroom.getTeacher().getUserName())
                .status(status)
                .build();
    }

    private ClassMemberResponse toMemberResponse(ClassMember member) {
        return ClassMemberResponse.builder()
                .id(member.getId())
                .studentId(member.getStudent().getId())
                .studentName(member.getStudent().getUserName())
                .studentEmail(member.getStudent().getUserEmail())
                .status(member.getStatus())
                .joinedAt(member.getJoinedAt())
                .build();
    }
}
