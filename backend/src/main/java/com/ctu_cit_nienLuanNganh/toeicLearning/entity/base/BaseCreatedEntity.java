package com.ctu_cit_nienLuanNganh.toeicLearning.entity.base;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@MappedSuperclass // Anotation giúp cho spring boot biết đây không phải là một bảng
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder //Anotation giúp lớp con build được lớp cha
public abstract class BaseCreatedEntity extends BaseEntity {
    @CreationTimestamp
    @Column(name="created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;
}
