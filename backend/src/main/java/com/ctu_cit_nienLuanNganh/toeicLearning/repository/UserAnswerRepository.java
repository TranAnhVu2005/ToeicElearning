package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.TestResult;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.UserAnswer;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserAnswerRepository extends BaseRepository<UserAnswer, String> {
    //Lấy dữ liệu làm bài chi tiết của TestResult thông qua resultId của nó
    @Query("SELECT ua FROM UserAnswer ua JOIN FETCH ua.question q JOIN FETCH q.contextQuestion cq WHERE ua.testResult.id = :resultId ORDER BY q.questionNumber ASC")
    List<UserAnswer> findByTestResultIdWithDetails(@Param("resultId") String resultId);
}
