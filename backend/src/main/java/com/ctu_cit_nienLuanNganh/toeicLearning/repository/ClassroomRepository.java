package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Classroom;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClassroomRepository extends BaseRepository<Classroom, String> {
    List<Classroom> findByTeacher_IdOrderByCreatedAtDesc(String teacherId);
    Optional<Classroom> findByClassCode(String classCode);

    // Use native FOR UPDATE so MariaDB does not fail on Hibernate's generated "FOR UPDATE OF alias".
    @Query(value = "SELECT c.* FROM classroom c WHERE c.class_code = :classCode FOR UPDATE", nativeQuery = true)
    Optional<Classroom> findByClassCodeForUpdate(@Param("classCode") String classCode);

    @Query(value = "SELECT c.* FROM classroom c WHERE c.id = :classroomId FOR UPDATE", nativeQuery = true)
    Optional<Classroom> findByIdForUpdate(@Param("classroomId") String classroomId);

    boolean existsByClassCode(String classCode);
}
