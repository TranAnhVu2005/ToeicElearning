package com.ctu_cit_nienLuanNganh.toeicLearning.module.notification;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.notification.dto.NotificationResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> getMine(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @RequestParam(defaultValue = "ALL") String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.getMine(currentUser, unreadOnly, category, page, size)));
    }

    @GetMapping("/me/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal User currentUser) {
        long unreadCount = notificationService.countUnread(currentUser);
        long totalCount = notificationService.countTotal(currentUser);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "unreadCount", unreadCount,
                "totalCount", totalCount)));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(
            @AuthenticationPrincipal User currentUser, @PathVariable String notificationId) {
        notificationService.markRead(currentUser, notificationId);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu thông báo đã đọc"));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> markAllRead(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu tất cả là đã đọc",
                Map.of("updatedCount", notificationService.markAllRead(currentUser))));
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @AuthenticationPrincipal User currentUser, @PathVariable String notificationId) {
        notificationService.deleteNotification(currentUser, notificationId);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa thông báo"));
    }

    @DeleteMapping("/read")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> deleteReadNotifications(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success("Đã xóa các thông báo đã đọc",
                Map.of("deletedCount", notificationService.deleteReadNotifications(currentUser))));
    }
}
