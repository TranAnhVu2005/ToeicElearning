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

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.role WHERE LOWER(TRIM(u.userEmail)) = LOWER(TRIM(:email))")
    Optional<User> findByUserEmailWithRole(@Param("email") String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.role WHERE u.googleSub = :googleSub")
    Optional<User> findByGoogleSubWithRole(@Param("googleSub") String googleSub);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.role WHERE TRIM(u.userNumberphone) = TRIM(:numberPhone)")
    Optional<User> findByUserNumberPhoneWithRole(@Param("numberPhone") String numberPhone);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.role WHERE u.id = :id")
    Optional<User> findByIdWithRole(@Param("id") String id);

    // Keep this as an explicit row lock: Hibernate's generated "FOR UPDATE OF alias"
    // is not accepted by MariaDB, which is used by local development environments.
    // Callers run inside a service transaction; role remains lazily loadable as needed.
    @Query(value = "SELECT u.* FROM `user` u WHERE u.id = :id FOR UPDATE", nativeQuery = true)
    Optional<User> findByIdWithRoleForUpdate(@Param("id") String id);

    Optional<User> findByUserEmail(String userEmail);
    Optional<User> findByUserNumberphone(String userNumberPhone);

    boolean existsByUserEmail(String userEmail);

    boolean existsByUserNumberphone(String userNumberphone);

    java.util.List<User> findByRole_RoleNameAndIsLockedFalse(String roleName);

    // Phục vụ Admin xem danh sách User có tìm kiếm, trong danh sách sẽ có vai trò,
    @Query(value = "SELECT u FROM User u JOIN FETCH u.role WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR " + //Nếu mà không gõ gì thì trả về true, where được bỏ ra, lấy hết user
            "LOWER(u.userName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.userEmail) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "u.userNumberphone LIKE CONCAT('%', :keyword, '%'))",
            countQuery = "SELECT COUNT(u) FROM User u WHERE " +
                    "(:keyword IS NULL OR :keyword = '' OR " +
                    "LOWER(u.userName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                    "LOWER(u.userEmail) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                    "u.userNumberphone LIKE CONCAT('%', :keyword, '%'))")
    Page<User> findAllUsersWithRole(@Param("keyword") String keyword, Pageable pageable);
}
