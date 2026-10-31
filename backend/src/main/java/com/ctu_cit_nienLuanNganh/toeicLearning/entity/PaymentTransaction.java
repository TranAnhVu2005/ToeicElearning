package com.ctu_cit_nienLuanNganh.toeicLearning.entity;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transaction")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PaymentTransaction extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "vnp_txn_ref", nullable = false, unique = true, length = 100)
    private String vnpTxnRef;

    @Column(name = "product_type", length = 40)
    private String productType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_application_id")
    private TeacherApplication teacherApplication;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id")
    private Test test;

    @Column(name = "product_name_snapshot", length = 255)
    private String productNameSnapshot;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @CreationTimestamp
    @Column(name = "payment_date", updatable = false)
    private LocalDateTime paymentDate;

    @Column(name = "vnp_transaction_no", length = 32)
    private String vnpTransactionNo;

    @Column(name = "vnp_response_code", length = 8)
    private String vnpResponseCode;

    @Column(name = "vnp_transaction_status", length = 8)
    private String vnpTransactionStatus;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;
}
