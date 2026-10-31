package com.ctu_cit_nienLuanNganh.toeicLearning.entity;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TestStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.base.BaseCreatedUpdatedEntity;
import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiViews;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.List;
import java.math.BigDecimal;

@Entity
@Table(name = "test")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Test extends BaseCreatedUpdatedEntity {
    @Column(name = "title_test", nullable = false)
    @JsonView(ApiViews.Public.class)
    private String titleTest;

    @Enumerated(EnumType.STRING) //Nếu không dùng hibernate sẽ lưu số tự tự của enum
    @Column(name = "status", length = 20)
    @Builder.Default //Thiết lập giá trị mặc định
    @JsonView(ApiViews.Public.class)
    private TestStatus status = TestStatus.DRAFT;

    @Builder.Default
    @JsonView(ApiViews.Public.class)
    @Column(name = "is_vip", nullable = false)
    private Boolean isVip = false;

    @JsonView(ApiViews.Public.class)
    @Column(name = "vip_price_vnd", precision = 10, scale = 0)
    private BigDecimal vipPriceVnd;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id")
    @JsonIgnore
    private Classroom classroom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_teacher_id")
    @JsonIgnore
    private User ownerTeacher;

    @Transient
    @JsonView(ApiViews.Public.class)
    private String classroomId;

    // Sau khi xóa test thì các contextquestion của nó cũng mất đi
    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonView({ApiViews.ExamDetail.class, ApiViews.Admin.class})
    @OrderBy("orderIndex ASC")
    private List<ContextQuestion> contextQuestions;
}
