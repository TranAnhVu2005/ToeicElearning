package com.ctu_cit_nienLuanNganh.toeicLearning.entity;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TestStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.base.BaseCreatedUpdatedEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(name = "test")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Test extends BaseCreatedUpdatedEntity {
    @Column(name = "title_test", nullable = false)
    private String titleTest;

    @Enumerated(EnumType.STRING) //Nếu không dùng hibernate sẽ lưu số tự tự của enum
    @Column(name = "status", length = 20)
    @Builder.Default //Thiết lập giá trị mặc định
    private TestStatus status = TestStatus.DRAFT;

    // Sau khi xóa test thì các contextquestion của nó cũng mất đi
    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ContextQuestion> contextQuestions;
}