package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.ClassMember;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClassMemberRepository extends BaseRepository<ClassMember, String> {
    Optional<ClassMember> findByClassroom_IdAndStudent_Id(String classroomId, String studentId);

    // Use native FOR UPDATE so MariaDB does not fail on Hibernate's generated "FOR UPDATE OF alias".
    @Query(value = "SELECT m.* FROM class_member m WHERE m.class_id = :classroomId AND m.student_id = :studentId FOR UPDATE",
            nativeQuery = true)
    Optional<ClassMember> findForUpdateByClassroomAndStudent(@Param("classroomId") String classroomId,
                                                             @Param("studentId") String studentId);

    @Query(value = "SELECT m.* FROM class_member m WHERE m.id = :memberId AND m.class_id = :classroomId FOR UPDATE",
            nativeQuery = true)
    Optional<ClassMember> findOwnedForUpdate(@Param("memberId") String memberId,
                                             @Param("classroomId") String classroomId);

    List<ClassMember> findByStudent_IdOrderByJoinedAtDesc(String studentId);
    List<ClassMember> findByClassroom_IdOrderByJoinedAtAsc(String classroomId);
    List<ClassMember> findByClassroom_IdAndStatusOrderByJoinedAtAsc(String classroomId, String status);
}
