package com.ctu_cit_nienLuanNganh.toeicLearning.entity;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.base.BaseCreatedUpdatedEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonView;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiViews;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(name = "context_question")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ContextQuestion extends BaseCreatedUpdatedEntity {
    @Column(name = "audio_url")
    @JsonView(ApiViews.ExamDetail.class)
    private String audioUrl;

    @Column(name = "image_url")
    @JsonView(ApiViews.ExamDetail.class)
    private String imageUrl;

    @Column(name = "audio_public_id", length = 512)
    @JsonView(ApiViews.Admin.class)
    private String audioPublicId;

    @Column(name = "image_public_id", length = 512)
    @JsonView(ApiViews.Admin.class)
    private String imagePublicId;

    @Column(name = "audio_format", length = 16)
    @JsonView(ApiViews.Admin.class)
    private String audioFormat;

    @Column(name = "image_format", length = 16)
    @JsonView(ApiViews.Admin.class)
    private String imageFormat;

    @Column(name = "audio_delivery_type", length = 16)
    @JsonView(ApiViews.Admin.class)
    private String audioDeliveryType;

    @Column(name = "image_delivery_type", length = 16)
    @JsonView(ApiViews.Admin.class)
    private String imageDeliveryType;

    @Column(name = "paragraph", columnDefinition = "TEXT")
    @JsonView(ApiViews.ExamDetail.class)
    private String paragraph;

    @Column(name = "transcript", columnDefinition = "TEXT")
    @JsonView(ApiViews.Admin.class)
    private String transcript;

    @Column(name = "translation", columnDefinition = "TEXT")
    @JsonView(ApiViews.Admin.class)
    private String translation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id")
    @JsonIgnore //Cắt đứt vòng lặp chạy về test
    private Test test;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id")
    @JsonIgnore
    private Part part;

    @Column(name = "order_index")
    @Builder.Default
    @JsonView(ApiViews.ExamDetail.class)
    private Integer orderIndex = 0;

    @OneToMany(mappedBy = "contextQuestion", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("questionNumber ASC") //Lấy câu hỏi theo số thứ tự tăng dần
    @JsonView(ApiViews.ExamDetail.class)
    private List<Question> questions;
}
