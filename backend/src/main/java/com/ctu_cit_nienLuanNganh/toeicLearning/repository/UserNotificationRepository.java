package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Notification;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserNotificationRepository extends BaseRepository<Notification, String> {
    Page<Notification> findByUser_Id(String userId, Pageable pageable);
    Page<Notification> findByUser_IdAndIsReadFalse(String userId, Pageable pageable);
    Optional<Notification> findByIdAndUser_Id(String id, String userId);
    long countByUser_IdAndIsReadFalse(String userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Notification n set n.isRead = true where n.user.id = :userId and n.isRead = false")
    int markAllReadByUserId(@Param("userId") String userId);
}
