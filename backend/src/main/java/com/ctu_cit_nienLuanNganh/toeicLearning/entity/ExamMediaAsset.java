package com.ctu_cit_nienLuanNganh.toeicLearning.entity;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.base.BaseCreatedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "exam_media_asset", uniqueConstraints = {
        @UniqueConstraint(name = "uk_exam_media_asset_public_id", columnNames = "public_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ExamMediaAsset extends BaseCreatedEntity {
    @Column(name = "public_id", nullable = false, length = 512)
    private String publicId;

    @Column(name = "media_format", nullable = false, length = 16)
    private String format;

    @Column(name = "resource_type", nullable = false, length = 16)
    private String resourceType;

    @Column(name = "delivery_type", nullable = false, length = 16)
    private String deliveryType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_id", nullable = false)
    private User uploadedBy;
}
