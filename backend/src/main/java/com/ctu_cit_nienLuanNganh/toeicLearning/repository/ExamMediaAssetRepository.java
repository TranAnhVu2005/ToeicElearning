package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.ExamMediaAsset;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;

import java.util.Optional;

public interface ExamMediaAssetRepository extends BaseRepository<ExamMediaAsset, String> {
    Optional<ExamMediaAsset> findByPublicId(String publicId);
    void deleteByPublicId(String publicId);
}
