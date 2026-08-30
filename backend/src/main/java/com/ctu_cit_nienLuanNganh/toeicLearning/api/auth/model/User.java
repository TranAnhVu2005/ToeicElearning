package com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.model;

import com.ctu_cit_nienLuanNganh.toeicLearning.helper.base.model.BaseCreatedUpdatedModel;
import com.ctu_cit_nienLuanNganh.toeicLearning.helper.base.model.BaseModel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name= "user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class User extends BaseCreatedUpdatedModel {
    @Column(name = "user_name", nullable = false)
    private String userName;

    @Column(name = "user_email", nullable = false, unique = true)
    private String userEmail;

    @Column(name = "user_numberphone", nullable = false, unique = true)
    private String userNumberphone;

    @Column(name = "user_password", nullable = false)
    private String userPassword;

    @Column(name = "user_avatar")
    private String userAvatar;

    @Builder.Default
    @Column(name = "is_locked")
    private Boolean isLocked = false;

    @Column(name = "role_id", length = 36)
    private String roleId;
}
