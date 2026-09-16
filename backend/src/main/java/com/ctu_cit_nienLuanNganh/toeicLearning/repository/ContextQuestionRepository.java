package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.ContextQuestion;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;

import java.util.List;
import java.util.Optional;

public interface ContextQuestionRepository extends BaseRepository<ContextQuestion, String> {
    List<ContextQuestion> findByTestIdAndPartId(String testId, String partId);
    List<ContextQuestion> findByTestIdAndPartIdOrderByOrderIndexAsc(String testId, String partId);
}
