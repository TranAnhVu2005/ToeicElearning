package com.ctu_cit_nienLuanNganh.toeicLearning.module.notification.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Notification;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.notification.dto.NotificationResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.UserNotificationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final UserNotificationRepository notificationRepository;

    @Transactional
    public PageResponse<NotificationResponse> getMine(User currentUser, boolean unreadOnly, int page, int size) {
        if (page < 1 || page > 10_000 || size < 1 || size > 50) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));
        var notifications = unreadOnly
                ? notificationRepository.findByUser_IdAndIsReadFalse(currentUser.getId(), pageable)
                : notificationRepository.findByUser_Id(currentUser.getId(), pageable);
        return PageResponse.of(notifications.map(this::toResponse));
    }

    @Transactional
    public long countUnread(User currentUser) {
        return notificationRepository.countByUser_IdAndIsReadFalse(currentUser.getId());
    }

    @Transactional
    public void markRead(User currentUser, String notificationId) {
        Notification notification = notificationRepository.findByIdAndUser_Id(notificationId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public int markAllRead(User currentUser) {
        return notificationRepository.markAllReadByUserId(currentUser.getId());
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId()).title(notification.getTitle()).content(notification.getContent())
                .type(notification.getType()).link(notification.getLink())
                .read(Boolean.TRUE.equals(notification.getIsRead())).createdAt(notification.getCreatedAt())
                .build();
    }
}
