package com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.model.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.helper.base.repository.BaseRepository;

import java.util.Optional;

public interface UserRepository extends BaseRepository<User, String> {
    Optional<User> findByUserEmail(String userEmail);
    Optional<User> findByUserNumberphone(String userNumberPhone);

    boolean existsByUserEmail(String userEmail);

    boolean existsByUserNumberphone(String userNumberphone);
}
