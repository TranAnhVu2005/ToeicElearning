package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.ContextQuestion;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;

import java.util.List;
import java.util.Optional;

public interface ContextQuestionRepository extends BaseRepository<ContextQuestion, String> {
    List<ContextQuestion> findByTestIdAndPartId(String testId, String partId);
    List<ContextQuestion> findByTestIdAndPartIdOrderByOrderIndexAsc(String testId, String partId);
    boolean existsByAudioPublicIdAndIdNot(String audioPublicId, String id);
    boolean existsByImagePublicIdAndIdNot(String imagePublicId, String id);
    boolean existsByAudioUrlAndIdNot(String audioUrl, String id);
    boolean existsByImageUrlAndIdNot(String imageUrl, String id);
    long countByAudioPublicIdAndTest_IdNot(String audioPublicId, String testId);
    long countByImagePublicIdAndTest_IdNot(String imagePublicId, String testId);
    long countByAudioUrlAndTest_IdNot(String audioUrl, String testId);
    long countByImageUrlAndTest_IdNot(String imageUrl, String testId);
}
