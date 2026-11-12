package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Assignment;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AssignmentRepository extends BaseRepository<Assignment, String> {
    List<Assignment> findByClassroom_IdAndIsActiveTrueOrderByDeadlineAsc(String classroomId);
    java.util.Optional<Assignment> findByIdAndIsActiveTrue(String id);

    // Use native FOR UPDATE so MariaDB does not fail on Hibernate's generated "FOR UPDATE OF alias".
    @Query(value = "SELECT a.* FROM assignment a WHERE a.id = :id FOR UPDATE", nativeQuery = true)
    java.util.Optional<Assignment> findByIdForUpdate(@Param("id") String id);

    boolean existsByTest_Id(String testId);
}
