package com.ctu_cit_nienLuanNganh.toeicLearning.module.notification.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Notification;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.notification.dto.NotificationResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.UserNotificationRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private static final Map<String, Set<String>> CATEGORY_TYPES = Map.of(
            "EXAM", Set.of("EXAM_RESULT", "EXAM"),
            "CLASSROOM", Set.of("CLASSROOM", "CLASSROOM_JOIN_REQUEST", "CLASSROOM_MEMBER_APPROVED", "CLASSROOM_MEMBER_STATUS", "CLASSROOM_MATERIAL"),
            "ASSIGNMENT", Set.of("ASSIGNMENT", "ASSIGNMENT_CREATED", "ASSIGNMENT_DEADLINE_CHANGED", "ASSIGNMENT_FEEDBACK", "ASSIGNMENT_SUBMITTED"),
            "PAYMENT", Set.of("PAYMENT", "TEST_VIP_PURCHASE", "TEACHER_APPLICATION_PAYMENT"),
            "SYSTEM", Set.of("SYSTEM", "WELCOME", "ACCOUNT_SECURITY", "TEACHER_APPLICATION", "TEACHER_APPLICATION_SUBMITTED", "COMMENT_MODERATED")
    );

    private final UserNotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public PageResponse<NotificationResponse> getMine(User currentUser, boolean unreadOnly, String category, int page, int size) {
        if (page < 1 || page > 10_000 || size < 1 || size > 50) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));
        String normalizedCategory = category == null || category.isBlank()
                ? "ALL" : category.trim().toUpperCase(Locale.ROOT);

        Page<Notification> notifications;
        if ("ALL".equals(normalizedCategory)) {
            notifications = unreadOnly
                    ? notificationRepository.findByUser_IdAndIsReadFalse(currentUser.getId(), pageable)
                    : notificationRepository.findByUser_Id(currentUser.getId(), pageable);
        } else {
            Set<String> allowedTypes = CATEGORY_TYPES.getOrDefault(normalizedCategory, Set.of(normalizedCategory));
            notifications = unreadOnly
                    ? notificationRepository.findByUser_IdAndIsReadFalseAndTypeIn(currentUser.getId(), allowedTypes, pageable)
                    : notificationRepository.findByUser_IdAndTypeIn(currentUser.getId(), allowedTypes, pageable);
        }
        return PageResponse.of(notifications.map(this::toResponse));
    }

    @Transactional
    public long countUnread(User currentUser) {
        return notificationRepository.countByUser_IdAndIsReadFalse(currentUser.getId());
    }

    @Transactional
    public long countTotal(User currentUser) {
        return notificationRepository.countByUser_Id(currentUser.getId());
    }

    @Transactional
    public void markRead(User currentUser, String notificationId) {
        Notification notification = notificationRepository.findByIdAndUser_Id(notificationId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        if (!Boolean.TRUE.equals(notification.getIsRead())) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public int markAllRead(User currentUser) {
        return notificationRepository.markAllReadByUserId(currentUser.getId());
    }

    @Transactional
    public void deleteNotification(User currentUser, String notificationId) {
        int deleted = notificationRepository.deleteByIdAndUserId(notificationId, currentUser.getId());
        if (deleted == 0) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }
    }

    @Transactional
    public int deleteReadNotifications(User currentUser) {
        return notificationRepository.deleteReadByUserId(currentUser.getId());
    }

    @Transactional
    public void createNotification(User recipient, String title, String content, String type, String link) {
        if (recipient == null || recipient.getId() == null) return;
        notificationRepository.save(Notification.builder()
                .user(recipient)
                .title(title)
                .content(content)
                .type(type)
                .link(link)
                .isRead(false)
                .build());
    }

    @Transactional
    public void createNotifications(Collection<User> recipients, String title, String content, String type, String link) {
        if (recipients == null || recipients.isEmpty()) return;
        List<Notification> batch = new ArrayList<>();
        for (User recipient : recipients) {
            if (recipient == null || recipient.getId() == null) continue;
            batch.add(Notification.builder()
                    .user(recipient)
                    .title(title)
                    .content(content)
                    .type(type)
                    .link(link)
                    .isRead(false)
                    .build());
        }
        if (!batch.isEmpty()) {
            notificationRepository.saveAll(batch);
        }
    }

    @Transactional
    public void notifyAllAdmins(String title, String content, String type, String link) {
        List<User> admins = userRepository.findByRole_RoleNameAndIsLockedFalse("ROLE_ADMIN");
        createNotifications(admins, title, content, type, link);
    }

    public static String resolveCategory(String type) {
        if (type == null || type.isBlank()) return "SYSTEM";
        String upper = type.trim().toUpperCase(Locale.ROOT);
        for (Map.Entry<String, Set<String>> entry : CATEGORY_TYPES.entrySet()) {
            if (entry.getValue().contains(upper)) {
                return entry.getKey();
            }
        }
        if (upper.startsWith("EXAM")) return "EXAM";
        if (upper.startsWith("CLASSROOM")) return "CLASSROOM";
        if (upper.startsWith("ASSIGNMENT")) return "ASSIGNMENT";
        if (upper.contains("PAYMENT") || upper.contains("VIP")) return "PAYMENT";
        return "SYSTEM";
    }

    private NotificationResponse toResponse(Notification notification) {
        boolean isReadVal = Boolean.TRUE.equals(notification.getIsRead());
        String category = resolveCategory(notification.getType());
        return NotificationResponse.builder()
                .id(notification.getId())
                .notificationId(notification.getId())
                .title(notification.getTitle())
                .content(notification.getContent())
                .type(notification.getType())
                .category(category)
                .link(notification.getLink())
                .referenceUrl(notification.getLink())
                .read(isReadVal)
                .isRead(isReadVal)
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
