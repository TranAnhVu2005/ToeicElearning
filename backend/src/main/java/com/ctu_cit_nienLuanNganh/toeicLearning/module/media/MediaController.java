package com.ctu_cit_nienLuanNganh.toeicLearning.module.media;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.service.CloudinaryService;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.media.service.ExamMediaAssetService;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.service.LoginRateLimitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;


import java.util.Map;

@RestController
@RequestMapping("/api/media")
@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
@RequiredArgsConstructor
public class MediaController {
    private final CloudinaryService cloudinaryService;
    private final ExamMediaAssetService examMediaAssetService;
    private final LoginRateLimitService rateLimitService;

    @PostMapping(value = "/upload",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam("folder") String folder,
            @RequestParam(defaultValue = "false") boolean privateExamMedia,
            @AuthenticationPrincipal User currentUser,
            HttpServletRequest httpRequest
    )
    {
        String clientIp = httpRequest.getRemoteAddr();
        rateLimitService.checkAllowed("media-upload", clientIp, currentUser.getId(), 30, 20);
        rateLimitService.recordAttempt("media-upload", clientIp, currentUser.getId(), 30, 20);
        if (privateExamMedia) {
            CloudinaryService.PrivateMediaUpload uploaded = cloudinaryService.uploadPrivateExamMedia(file, folder);
            String resourceType = folder.endsWith("/audios") ? "video" : "image";
            try {
                examMediaAssetService.registerUpload(currentUser, uploaded, resourceType);
            } catch (RuntimeException exception) {
                cloudinaryService.deletePrivateExamMedia(uploaded.publicId(), resourceType);
                throw exception;
            }
            return ResponseEntity.ok(ApiResponse.success("Tải lên media riêng tư thành công", Map.of(
                    "url", uploaded.url(), "publicId", uploaded.publicId(), "format", uploaded.format(),
                    "deliveryType", uploaded.deliveryType())));
        }
        String fileUrl = cloudinaryService.uploadFile(file, folder);
        return ResponseEntity.ok(ApiResponse.success("Tải lên media thành công", Map.of("url",fileUrl)));
    }
}
