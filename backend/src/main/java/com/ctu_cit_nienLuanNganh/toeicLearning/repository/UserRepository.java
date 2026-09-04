package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
//Sử dụng để các biến ở service sử dụng @RequiredArgsConstructor
// Có thể được tiêm tự động vào IoC, chuyển các lỗi db về lỗi spring thuần
public interface UserRepository extends BaseRepository<User, String> {
    Optional<User> findByUserEmail(String userEmail);
    Optional<User> findByUserNumberphone(String userNumberPhone);

    boolean existsByUserEmail(String userEmail);

    boolean existsByUserNumberphone(String userNumberphone);
}
