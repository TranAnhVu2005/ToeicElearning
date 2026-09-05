package com.ctu_cit_nienLuanNganh.toeicLearning.entity;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.base.BaseCreatedUpdatedEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name= "user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class User extends BaseCreatedUpdatedEntity {
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

    //Cơ chế tải lười, khi lấy user, hibernate chưa vội lấy Role ngay, nó thực hiện sql lấy role khi
    // gọi user.getRole();
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name= "role_id", nullable = false) // Xác định khóa ngoại
    private Role role;
}
