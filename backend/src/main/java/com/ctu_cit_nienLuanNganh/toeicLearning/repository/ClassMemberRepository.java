package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.ClassMember;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClassMemberRepository extends BaseRepository<ClassMember, String> {
    Optional<ClassMember> findByClassroom_IdAndStudent_Id(String classroomId, String studentId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from ClassMember m where m.classroom.id = :classroomId and m.student.id = :studentId")
    Optional<ClassMember> findForUpdateByClassroomAndStudent(@Param("classroomId") String classroomId,
                                                              @Param("studentId") String studentId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from ClassMember m where m.id = :memberId and m.classroom.id = :classroomId")
    Optional<ClassMember> findOwnedForUpdate(@Param("memberId") String memberId,
                                             @Param("classroomId") String classroomId);

    List<ClassMember> findByStudent_IdOrderByJoinedAtDesc(String studentId);
    List<ClassMember> findByClassroom_IdOrderByJoinedAtAsc(String classroomId);
    List<ClassMember> findByClassroom_IdAndStatusOrderByJoinedAtAsc(String classroomId, String status);
}
