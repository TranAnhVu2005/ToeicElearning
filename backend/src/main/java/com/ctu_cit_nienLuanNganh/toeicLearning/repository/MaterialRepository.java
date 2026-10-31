package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Material;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MaterialRepository extends BaseRepository<Material, String> {
    @Query(value = "SELECT COALESCE(SUM(COALESCE(size_bytes, 10485760)), 0) FROM material WHERE class_id = :classroomId",
            nativeQuery = true)
    long sumStoredBytesByClassroom(@Param("classroomId") String classroomId);

    List<Material> findByClassroom_IdAndActiveTrueOrderByCreatedAtDesc(String classroomId);
    Optional<Material> findByIdAndClassroom_IdAndActiveTrue(String id, String classroomId);
}
