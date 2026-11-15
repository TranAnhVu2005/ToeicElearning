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

    @Column(name = "payos_order_code", nullable = false, unique = true, length = 100)
    private String payosOrderCode;

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
    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "payos_reference", length = 64)
    private String payosReference;

    @Column(name = "payos_code", length = 16)
    private String payosCode;

    @Column(name = "payos_status", length = 16)
    private String payosStatus;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;
}
