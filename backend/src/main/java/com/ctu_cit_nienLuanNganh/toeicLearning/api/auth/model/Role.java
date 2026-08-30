package com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.model;

import com.ctu_cit_nienLuanNganh.toeicLearning.helper.base.model.BaseCreatedUpdatedModel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name= "role")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Role extends BaseCreatedUpdatedModel {
    @Column(name = "role_name", nullable = false)
    private String roleName;
}
