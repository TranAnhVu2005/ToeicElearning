package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Part;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;

import java.util.Optional;

public interface PartRepository extends BaseRepository<Part, String> {
    Optional<Part> findByNamePart(String namePart);
}
