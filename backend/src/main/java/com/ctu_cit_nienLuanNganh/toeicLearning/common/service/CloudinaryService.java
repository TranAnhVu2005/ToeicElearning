package com.ctu_cit_nienLuanNganh.toeicLearning.common.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {
    private final Cloudinary cloudinary;
    public String uploadFile(MultipartFile file, String folder) {
        if(file == null || file.isEmpty()){
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }

        try{
            Map<?,?> params = ObjectUtils.asMap(
                    "folder",(folder!=null && !folder.isBlank()) ? folder : "Resource/common",
                    "resource_type", "auto"
            );

            Map<?, ?> uploadResutt = cloudinary.uploader().upload(file.getBytes(), params);
            return uploadResutt.get("secure_url").toString();
        }
        catch (IOException e){
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    public boolean deleteFileByUrl(String fileUrl){
        //Xử lý file của cloudinary thôi
        if(fileUrl==null || fileUrl.isBlank() || !fileUrl.contains("cloudinary.com")){
            return false;
        }
        try{
            String resourceType = (fileUrl.contains("/video/") || fileUrl.endsWith(".mp3") || fileUrl.endsWith(".wav"))
                    ? "video"
                    : "image";

            //Trích xuất publicID từ URL
            int uploadIndex = fileUrl.indexOf("/upload/");
            if(uploadIndex == -1) return false;

            String pathAfterUpload = fileUrl.substring(uploadIndex + 8); // Bỏ qua chữ "/upload/"
            pathAfterUpload = pathAfterUpload.replaceFirst("^v\\d+/", ""); // Bỏ qua version "v1234567890/" nếu có

            int dotIndex = pathAfterUpload.lastIndexOf('.');
            String publicId = (dotIndex != -1) ? pathAfterUpload.substring(0, dotIndex) : pathAfterUpload;

            Map<?,?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type",resourceType));

            log.info("Kết quả xóa file cũ trên Cloudinary [{}]: {}", publicId, result.get("result"));
            return "ok".equals(result.get("result"));
        } catch (Exception e){
            // Chỉ ghi nhận cảnh báo vào Console để lập trình viên theo dõi
            log.warn("Không thể xóa file cũ trên Cloudinary (có thể file không tồn tại hoặc đã bị xóa trước đó): {}", e.getMessage());
            return false; // Trả về false nhưng KHÔNG làm gián đoạn việc upload file mới
        }
    }
}
