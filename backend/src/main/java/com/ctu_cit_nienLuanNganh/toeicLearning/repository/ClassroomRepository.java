package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Classroom;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClassroomRepository extends BaseRepository<Classroom, String> {
    List<Classroom> findByTeacher_IdOrderByCreatedAtDesc(String teacherId);
    Optional<Classroom> findByClassCode(String classCode);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Classroom c WHERE c.classCode = :classCode")
    Optional<Classroom> findByClassCodeForUpdate(@Param("classCode") String classCode);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Classroom c WHERE c.id = :classroomId")
    Optional<Classroom> findByIdForUpdate(@Param("classroomId") String classroomId);
    boolean existsByClassCode(String classCode);
}
