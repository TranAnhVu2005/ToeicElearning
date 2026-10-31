package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.UserPresence;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface UserPresenceRepository extends BaseRepository<UserPresence, String> {
    @Modifying
    @Query(value = "INSERT INTO user_presence (user_id, last_seen_at) VALUES (:userId, :now) " +
            "ON DUPLICATE KEY UPDATE last_seen_at = CASE " +
            "WHEN last_seen_at < :refreshBefore THEN :now ELSE last_seen_at END", nativeQuery = true)
    int touchPresence(@Param("userId") String userId,
                      @Param("now") LocalDateTime now,
                      @Param("refreshBefore") LocalDateTime refreshBefore);

    @Query(value = "SELECT COUNT(*) FROM user_presence p " +
            "JOIN `user` u ON u.id = p.user_id " +
            "WHERE p.last_seen_at > :cutoff AND COALESCE(u.is_locked, FALSE) = FALSE", nativeQuery = true)
    long countActiveUsers(@Param("cutoff") LocalDateTime cutoff);
}
