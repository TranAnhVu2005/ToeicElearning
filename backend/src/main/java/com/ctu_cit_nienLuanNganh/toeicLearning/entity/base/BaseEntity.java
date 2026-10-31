package com.ctu_cit_nienLuanNganh.toeicLearning.entity.base;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import com.fasterxml.jackson.annotation.JsonView;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiViews;
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
public abstract class BaseEntity {
    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name="id",updatable = false, nullable = false, length = 36)
    @JsonView(ApiViews.Public.class)
    private String id;
}
