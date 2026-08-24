package com.ctu_cit_nienLuanNganh.toeicLearning.helper.base.model;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.UuidGenerator;

@MappedSuperclass
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
public abstract class BaseModel {
    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name="id",updatable = false, nullable = false, length = 36)
    private String id;
}
