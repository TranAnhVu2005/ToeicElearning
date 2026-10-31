package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Assignment;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AssignmentRepository extends BaseRepository<Assignment, String> {
    List<Assignment> findByClassroom_IdAndIsActiveTrueOrderByDeadlineAsc(String classroomId);
    java.util.Optional<Assignment> findByIdAndIsActiveTrue(String id);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Assignment a where a.id = :id")
    java.util.Optional<Assignment> findByIdForUpdate(@Param("id") String id);
    boolean existsByTest_Id(String testId);
}
