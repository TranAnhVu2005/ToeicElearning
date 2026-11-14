package com.ctu_cit_nienLuanNganh.toeicLearning.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.PaymentTransaction;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

import java.time.LocalDateTime;

public interface PaymentTransactionRepository extends BaseRepository<PaymentTransaction, String> {
    // Use native FOR UPDATE so MariaDB does not fail on Hibernate's generated "FOR UPDATE OF alias".
    @Query(value = "SELECT p.* FROM payment_transaction p WHERE p.vnp_txn_ref = :txnRef FOR UPDATE", nativeQuery = true)
    Optional<PaymentTransaction> findForUpdateByVnpTxnRef(@Param("txnRef") String txnRef);

    Optional<PaymentTransaction> findByVnpTxnRefAndUser_Id(String txnRef, String userId);
    Page<PaymentTransaction> findByUser_IdOrderByPaymentDateDesc(String userId, Pageable pageable);
    Optional<PaymentTransaction> findTopByTeacherApplication_IdOrderByPaymentDateDesc(String applicationId);
    Optional<PaymentTransaction> findTopByUser_IdAndTest_IdAndProductTypeOrderByPaymentDateDesc(
            String userId, String testId, String productType);
    boolean existsByTest_Id(String testId);
    boolean existsByTeacherApplication_IdAndStatus(String applicationId, String status);
    @Query(value = "SELECT p FROM PaymentTransaction p JOIN FETCH p.user u " +
            "WHERE (:status IS NULL OR p.status = :status) " +
            "AND (:productType IS NULL OR p.productType = :productType) " +
            "AND (:fromDate IS NULL OR p.paymentDate >= :fromDate) " +
            "AND (:toDate IS NULL OR p.paymentDate <= :toDate) " +
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(u.userName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.userEmail) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.vnpTxnRef) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(COALESCE(p.productNameSnapshot, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(COALESCE(p.vnpTransactionNo, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))) ",
            countQuery = "SELECT COUNT(p) FROM PaymentTransaction p JOIN p.user u " +
                    "WHERE (:status IS NULL OR p.status = :status) " +
                    "AND (:productType IS NULL OR p.productType = :productType) " +
                    "AND (:fromDate IS NULL OR p.paymentDate >= :fromDate) " +
                    "AND (:toDate IS NULL OR p.paymentDate <= :toDate) " +
                    "AND (:keyword IS NULL OR :keyword = '' OR " +
                    "LOWER(u.userName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                    "LOWER(u.userEmail) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                    "LOWER(p.vnpTxnRef) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                    "LOWER(COALESCE(p.productNameSnapshot, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                    "LOWER(COALESCE(p.vnpTransactionNo, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))) ")
    Page<PaymentTransaction> searchForAdmin(@Param("status") String status,
                                            @Param("fromDate") LocalDateTime fromDate,
                                            @Param("toDate") LocalDateTime toDate,
                                            @Param("keyword") String keyword,
                                            @Param("productType") String productType,
                                            Pageable pageable);
}
