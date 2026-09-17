package com.ctu_cit_nienLuanNganh.toeicLearning.entity;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.base.BaseCreatedUpdatedEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
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
    private String audioUrl;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "paragraph", columnDefinition = "TEXT")
    private String paragraph;

    @Column(name = "transcript", columnDefinition = "TEXT")
    private String transcript;

    @Column(name = "translation", columnDefinition = "TEXT")
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
    private Integer orderIndex = 0;

    @OneToMany(mappedBy = "contextQuestion", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("questionNumber ASC") //Lấy câu hỏi theo số thứ tự tăng dần
    private List<Question> questions;
}