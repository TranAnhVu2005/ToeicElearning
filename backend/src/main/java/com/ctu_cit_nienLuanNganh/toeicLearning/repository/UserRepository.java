package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
//Sử dụng để các biến ở service sử dụng @RequiredArgsConstructor
// Có thể được tiêm tự động vào IoC, chuyển các lỗi db về lỗi spring thuần
public interface UserRepository extends BaseRepository<User, String> {

    @Query("SELECT u from User u JOIN FETCH u.role where u.userEmail = :email")
    Optional<User> findByUserEmailWithRole(@Param("email") String email);

    @Query("SELECT u from User u JOIN FETCH u.role where u.userNumberphone = :numberPhone")
    Optional<User> findByUserNumberPhoneWithRole(@Param("numberPhone") String numberPhone);

    @Query("SELECT u FROM User u JOIN FETCH u.role WHERE u.id = :id")
    Optional<User> findByIdWithRole(@Param("id") String id);

    Optional<User> findByUserEmail(String userEmail);
    Optional<User> findByUserNumberphone(String userNumberPhone);

    boolean existsByUserEmail(String userEmail);

    boolean existsByUserNumberphone(String userNumberphone);

    // Phục vụ Admin xem danh sách User có tìm kiếm, trong danh sách sẽ có vai trò,
    @Query("SELECT u FROM User u JOIN FETCH u.role WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR " + //Nếu mà không gõ gì thì trả về true, where được bỏ ra, lấy hết user
            "LOWER(u.userName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.userEmail) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "u.userNumberphone LIKE CONCAT('%', :keyword, '%'))")
    Page<User> findAllUsersWithRole(@Param("keyword") String keyword, Pageable pageable);
}
