package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TestStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Test;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TestCatalogCategory;

public interface TestRepository extends BaseRepository<Test, String>{
    Page<Test> findByClassroom_IdAndOwnerTeacher_Id(String classroomId, String teacherId, Pageable pageable);
    java.util.Optional<Test> findByIdAndClassroom_IdAndOwnerTeacher_Id(String id, String classroomId, String teacherId);
    java.util.List<Test> findByClassroom_IdAndOwnerTeacher_Id(String classroomId, String teacherId);
    Page<Test> findByStatus(TestStatus status, Pageable pageable);
    Page<Test> findByStatusAndClassroomIsNull(TestStatus status, Pageable pageable);
    @Query(value = "SELECT DISTINCT t FROM Test t WHERE t.status = :status AND t.classroom IS NULL " +
            "AND (:category = 'ALL' " +
            "OR (:category = 'FULL' " +
            "AND (SELECT COUNT(q) FROM Question q JOIN q.contextQuestion cq WHERE cq.test = t) = 200) " +
            "OR (:category = 'LISTENING' " +
            "AND EXISTS (SELECT cq.id FROM ContextQuestion cq WHERE cq.test = t AND cq.part.namePart IN ('Part 1','Part 2','Part 3','Part 4'))) " +
            "OR (:category = 'READING' " +
            "AND EXISTS (SELECT cq.id FROM ContextQuestion cq WHERE cq.test = t AND cq.part.namePart IN ('Part 5','Part 6','Part 7')))) " +
            "AND (:keyword = '' OR LOWER(t.titleTest) LIKE LOWER(CONCAT('%', :keyword, '%'))) ",
            countQuery = "SELECT COUNT(DISTINCT t.id) FROM Test t WHERE t.status = :status AND t.classroom IS NULL " +
                    "AND (:category = 'ALL' " +
                    "OR (:category = 'FULL' " +
                    "AND (SELECT COUNT(q) FROM Question q JOIN q.contextQuestion cq WHERE cq.test = t) = 200) " +
                    "OR (:category = 'LISTENING' " +
                    "AND EXISTS (SELECT cq.id FROM ContextQuestion cq WHERE cq.test = t AND cq.part.namePart IN ('Part 1','Part 2','Part 3','Part 4'))) " +
                    "OR (:category = 'READING' " +
                    "AND EXISTS (SELECT cq.id FROM ContextQuestion cq WHERE cq.test = t AND cq.part.namePart IN ('Part 5','Part 6','Part 7')))) " +
                    "AND (:keyword = '' OR LOWER(t.titleTest) LIKE LOWER(CONCAT('%', :keyword, '%')))" )
    Page<Test> findCatalogTests(@Param("status") TestStatus status, @Param("category") String category,
                                @Param("keyword") String keyword, Pageable pageable);
    Page<Test> findByStatusAndClassroomIsNullAndIsVipFalse(TestStatus status, Pageable pageable);
    Page<Test> findByStatusAndClassroom_IdAndOwnerTeacher_IdAndIsVipFalse(TestStatus status, String classroomId, String teacherId, Pageable pageable);
    @Query("SELECT t FROM Test t WHERE t.status = :status AND t.isVip = false AND (t.classroom IS NULL OR (t.classroom.id = :classroomId AND t.ownerTeacher.id = :teacherId))")
    Page<Test> findAssignableByStatus(@Param("status") TestStatus status, @Param("classroomId") String classroomId,
                                      @Param("teacherId") String teacherId, Pageable pageable);
    Page<Test> findByTitleTestContainingIgnoreCaseAndStatus(String titleTest, TestStatus status, Pageable pageable);
    Page<Test> findByTitleTestContainingIgnoreCaseAndStatusAndClassroomIsNull(String titleTest, TestStatus status, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Test t WHERE t.id = :id")
    java.util.Optional<Test> findForUpdateById(@Param("id") String id);
}
