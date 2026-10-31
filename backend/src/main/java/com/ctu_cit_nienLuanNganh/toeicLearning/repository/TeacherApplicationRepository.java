package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TeacherApplicationStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.TeacherApplication;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.Optional;

public interface TeacherApplicationRepository extends BaseRepository<TeacherApplication, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM TeacherApplication a JOIN FETCH a.user WHERE a.id = :id")
    Optional<TeacherApplication> findForUpdate(@Param("id") String id);
    Optional<TeacherApplication> findTopByUser_IdOrderByCreatedAtDesc(String userId);
    Page<TeacherApplication> findByStatus(TeacherApplicationStatus status, Pageable pageable);
    Page<TeacherApplication> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Optional<TeacherApplication> findByIdAndUser_Id(String id, String userId);
}
