package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.AssignmentSubmission;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;

import java.util.List;

public interface AssignmentSubmissionRepository extends BaseRepository<AssignmentSubmission, String> {
    List<AssignmentSubmission> findByAssignment_IdOrderByCreatedAtDesc(String assignmentId);
    List<AssignmentSubmission> findByAssignment_IdAndStudent_IdOrderByCreatedAtDesc(String assignmentId, String studentId);
}
