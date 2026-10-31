package com.ctu_cit_nienLuanNganh.toeicLearning.entity;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.base.BaseCreatedUpdatedEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonView;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiViews;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "question")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Question extends BaseCreatedUpdatedEntity {
    @Column(name = "question_content", columnDefinition = "TEXT")
    @JsonView(ApiViews.ExamDetail.class)
    private String questionContent;

    @Column(name = "option_a", length = 500)
    @JsonView(ApiViews.ExamDetail.class)
    private String optionA;

    @Column(name = "option_b", length = 500)
    @JsonView(ApiViews.ExamDetail.class)
    private String optionB;

    @Column(name = "option_c", length = 500)
    @JsonView(ApiViews.ExamDetail.class)
    private String optionC;

    @Column(name = "option_d", length = 500)
    @JsonView(ApiViews.ExamDetail.class)
    private String optionD;

    @JsonView(ApiViews.Admin.class)
    @Column(name = "correct_answer", nullable = false, length = 1)
    private char correctAnswer;

    @JsonView(ApiViews.Admin.class)
    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "question_number")
    @Builder.Default
    @JsonView(ApiViews.ExamDetail.class)
    private Integer questionNumber = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "context_question_id")
    @JsonIgnore
    private ContextQuestion contextQuestion;
}
