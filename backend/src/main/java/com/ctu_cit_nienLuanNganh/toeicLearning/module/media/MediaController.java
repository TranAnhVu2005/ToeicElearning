package com.ctu_cit_nienLuanNganh.toeicLearning.module.media;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.util.Map;

@RestController
@RequestMapping("/api/media")
@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
@RequiredArgsConstructor
public class MediaController {
    private final CloudinaryService cloudinaryService;

    @PostMapping(value = "/upload",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value="folder", required = false) String folder, //required = false, có thể có hoặc không, có thì là folder, không có thì là null
            @RequestParam(value= "oldUrl", required = false) String oldUrl
    )
    {
        if(oldUrl!=null && !oldUrl.isBlank()){
            cloudinaryService.deleteFileByUrl(oldUrl);
        }
        String targetFolder = (folder!=null && !folder.isBlank()) ? folder : "toeic-learning/other";
        String fileUrl = cloudinaryService.uploadFile(file, targetFolder);
        return ResponseEntity.ok(ApiResponse.success("Tải lên media thành công", Map.of("url",fileUrl)));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse<Void>> deleteMedia(@RequestParam("url") String url){
        cloudinaryService.deleteFileByUrl(url);
        return ResponseEntity.ok(ApiResponse.success("Xóa file thành công"));
    }
}
