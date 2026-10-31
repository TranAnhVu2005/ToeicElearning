package com.ctu_cit_nienLuanNganh.toeicLearning.module.media.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.service.CloudinaryService;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.ExamMediaAsset;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.ExamMediaAssetRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ExamMediaAssetService {
    private final ExamMediaAssetRepository assetRepository;

    @Transactional
    public void registerUpload(User uploader, CloudinaryService.PrivateMediaUpload uploaded, String resourceType) {
        if (uploader == null || uploaded == null || !"authenticated".equals(uploaded.deliveryType())
                || !("image".equals(resourceType) || "video".equals(resourceType))) {
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
        if (assetRepository.findByPublicId(uploaded.publicId()).isPresent()) {
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
        assetRepository.save(ExamMediaAsset.builder()
                .publicId(uploaded.publicId())
                .format(uploaded.format())
                .resourceType(resourceType)
                .deliveryType(uploaded.deliveryType())
                .uploadedBy(uploader)
                .build());
    }

    @Transactional
    public boolean canUse(User actor, String publicId, String format, String deliveryType, String resourceType) {
        if (actor == null || publicId == null) return false;
        return assetRepository.findByPublicId(publicId)
                .filter(asset -> asset.getUploadedBy() != null
                        && (isAdmin(actor) || actor.getId().equals(asset.getUploadedBy().getId()))
                        && Objects.equals(format, asset.getFormat())
                        && Objects.equals(resourceType, asset.getResourceType())
                        && Objects.equals(deliveryType, asset.getDeliveryType()))
                .isPresent();
    }

    @Transactional
    public void forget(String publicId) {
        if (publicId != null && !publicId.isBlank()) assetRepository.deleteByPublicId(publicId);
    }

    private boolean isAdmin(User actor) {
        return actor.getRole() != null && "ROLE_ADMIN".equals(actor.getRole().getRoleName());
    }
}
