package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.service.CloudinaryService;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.service.AuditEventService;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Assignment;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.ClassMember;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Classroom;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Material;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto.MaterialDownloadResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto.MaterialResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.notification.service.NotificationService;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.AssignmentRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.ClassMemberRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.ClassroomRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.MaterialRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialService {
    private static final String ROLE_TEACHER = "ROLE_TEACHER";
    private static final String ROLE_USER = "ROLE_USER";
    private static final String APPROVED = "APPROVED";
    private static final String CONTENT_TYPE_PDF = "application/pdf";

    private final ClassroomRepository classroomRepository;
    private final ClassMemberRepository classMemberRepository;
    private final MaterialRepository materialRepository;
    private final AssignmentRepository assignmentRepository;
    private final CloudinaryService cloudinaryService;
    private final AuditEventService auditEventService;
    private final NotificationService notificationService;

    @Value("${app.classroom.storage-quota-bytes:536870912}")
    private long classroomStorageQuotaBytes;

    @Transactional
    public List<MaterialResponse> list(User currentUser, String classroomId) {
        requireClassAccess(currentUser, classroomId);
        return materialRepository.findByClassroom_IdAndActiveTrueAndAssignmentAttachmentFalseOrderByCreatedAtDesc(classroomId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public MaterialResponse upload(User currentUser, String classroomId, String title, MultipartFile file) {
        return upload(currentUser, classroomId, title, file, true, false);
    }

    @Transactional
    public MaterialResponse upload(User currentUser, String classroomId, String title, MultipartFile file, boolean notifyStudents) {
        return upload(currentUser, classroomId, title, file, notifyStudents, false);
    }

    @Transactional
    public MaterialResponse upload(
            User currentUser,
            String classroomId,
            String title,
            MultipartFile file,
            boolean notifyStudents,
            boolean assignmentAttachment) {
        Classroom classroom = classroomRepository.findByIdForUpdate(classroomId)
                .filter(found -> found.getTeacher().getId().equals(currentUser.getId()))
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        String safeTitle = title == null ? "" : title.trim();
        if (safeTitle.isBlank() || safeTitle.length() > 120) throw new AppException(ErrorCode.VALIDATION_ERROR);
        long requestedBytes = file == null ? 0 : file.getSize();
        long storedBytes = materialRepository.sumStoredBytesByClassroom(classroomId);
        if (classroomStorageQuotaBytes <= 0 || requestedBytes > classroomStorageQuotaBytes
                || storedBytes > classroomStorageQuotaBytes - requestedBytes) {
            throw new AppException(ErrorCode.CLASSROOM_STORAGE_QUOTA_EXCEEDED);
        }

        String folder = "Resource/toeic-learning/classrooms/" + classroom.getId() + "/materials";
        CloudinaryService.PrivatePdfUpload uploadedFile = cloudinaryService.uploadPrivateClassPdf(file, folder);
        Material material = Material.builder()
                .title(safeTitle)
                .fileUrl(uploadedFile.secureUrl())
                .cloudinaryPublicId(uploadedFile.publicId())
                .fileFormat("pdf")
                .originalFileName(uploadedFile.originalFileName())
                .contentType(CONTENT_TYPE_PDF)
                .sizeBytes(uploadedFile.sizeBytes())
                .active(true)
                .assignmentAttachment(assignmentAttachment)
                .uploadedBy(currentUser)
                .classroom(classroom)
                .build();
        try {
            Material saved = materialRepository.save(material);
            auditEventService.record(currentUser, "CLASS_MATERIAL_UPLOADED", "MATERIAL", saved.getId(), "format=pdf");
            if (notifyStudents) {
                List<User> approvedStudents = classMemberRepository
                        .findByClassroom_IdAndStatusOrderByJoinedAtAsc(classroom.getId(), APPROVED)
                        .stream()
                        .map(ClassMember::getStudent)
                        .toList();
                notificationService.createNotifications(
                        approvedStudents,
                        "Tài liệu học tập mới trong lớp " + classroom.getClassName(),
                        "Giáo viên " + currentUser.getUserName() + " vừa đăng tài liệu PDF mới: \"" + saved.getTitle() + "\".",
                        "CLASSROOM_MATERIAL",
                        "/classrooms"
                );
            }
            return toResponse(saved);
        } catch (RuntimeException exception) {
            cloudinaryService.deletePrivateClassPdf(uploadedFile.publicId());
            throw exception;
        }
    }

    @Transactional
    public MaterialDownloadResponse createDownloadLink(User currentUser, String classroomId, String materialId) {
        return createDownloadLink(currentUser, classroomId, materialId, true);
    }

    @Transactional
    public MaterialDownloadResponse createDownloadLink(
            User currentUser, String classroomId, String materialId, boolean attachment) {
        requireClassAccess(currentUser, classroomId);
        Material material = materialRepository.findByIdAndClassroom_IdAndActiveTrue(materialId, classroomId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        if (material.getCloudinaryPublicId() == null || material.getFileFormat() == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }
        CloudinaryService.PrivateDownload download = cloudinaryService.createPrivateRawDownload(
                material.getCloudinaryPublicId(), material.getFileFormat(), attachment);
        return new MaterialDownloadResponse(download.url(), Instant.ofEpochSecond(download.expiresAt()));
    }

    @Transactional
    public MaterialPreviewContent loadPreviewContent(User currentUser, String classroomId, String materialId) {
        requireClassAccess(currentUser, classroomId);
        Material material = materialRepository.findByIdAndClassroom_IdAndActiveTrue(materialId, classroomId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        if (material.getCloudinaryPublicId() == null || material.getFileFormat() == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }
        CloudinaryService.PrivateDownload download = cloudinaryService.createPrivateRawDownload(
                material.getCloudinaryPublicId(), material.getFileFormat(), false);
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
            String fileName = material.getOriginalFileName() != null && !material.getOriginalFileName().isBlank()
                    ? material.getOriginalFileName()
                    : "Tai-lieu.pdf";
            return new MaterialPreviewContent(response.body(), fileName);
        } catch (AppException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }
    }

    public record MaterialPreviewContent(byte[] bytes, String fileName) { }

    @Transactional
    public void hide(User currentUser, String classroomId, String materialId) {
        requireOwnedClassroom(currentUser, classroomId);
        Material material = materialRepository.findByIdAndClassroom_IdAndActiveTrue(materialId, classroomId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        if (assignmentRepository.existsByMaterial_IdAndIsActiveTrue(materialId)) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION);
        }
        for (Assignment ref : assignmentRepository.findByMaterial_Id(materialId)) {
            ref.setMaterial(null);
            assignmentRepository.save(ref);
        }
        String publicId = material.getCloudinaryPublicId();
        String deletedId = material.getId();
        materialRepository.delete(material);
        materialRepository.flush();
        cloudinaryService.deletePrivateClassPdfQuietly(publicId);
        auditEventService.record(currentUser, "CLASS_MATERIAL_DELETED", "MATERIAL", deletedId, "deleted=true");
    }

    private Classroom requireClassAccess(User currentUser, String classroomId) {
        String role = roleName(currentUser);
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        if (ROLE_TEACHER.equals(role) && classroom.getTeacher().getId().equals(currentUser.getId())) return classroom;
        if (ROLE_USER.equals(role)) {
            ClassMember member = classMemberRepository.findByClassroom_IdAndStudent_Id(classroomId, currentUser.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
            if (APPROVED.equals(member.getStatus())) return classroom;
        }
        throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
    }

    private Classroom requireOwnedClassroom(User currentUser, String classroomId) {
        if (!ROLE_TEACHER.equals(roleName(currentUser))) throw new AppException(ErrorCode.UNAUTHORIZED);
        return classroomRepository.findById(classroomId)
                .filter(classroom -> classroom.getTeacher().getId().equals(currentUser.getId()))
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    private String roleName(User user) {
        return user.getRole() == null ? "" : user.getRole().getRoleName();
    }

    private MaterialResponse toResponse(Material material) {
        return new MaterialResponse(material.getId(), material.getTitle(), material.getOriginalFileName(),
                material.getSizeBytes(), material.getContentType(), material.getCreatedAt(),
                material.getUploadedBy() == null ? null : material.getUploadedBy().getUserName(),
                material.getCloudinaryPublicId() != null && material.getFileFormat() != null);
    }
}
