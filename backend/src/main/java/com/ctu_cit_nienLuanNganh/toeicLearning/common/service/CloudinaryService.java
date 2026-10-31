package com.ctu_cit_nienLuanNganh.toeicLearning.common.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Iterator;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {
    private static final Pattern VERSION_SEGMENT = Pattern.compile("v[0-9]+");
    private static final String APP_FOLDER_PREFIX = "Resource/toeic-learning/";
    private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;
    private static final long MAX_AUDIO_BYTES = 20L * 1024 * 1024;
    private static final long MAX_CLASS_PDF_BYTES = 10L * 1024 * 1024;
    private static final long PRIVATE_DOWNLOAD_TTL_SECONDS = 300;
    private static final long EXAM_MEDIA_DOWNLOAD_TTL_SECONDS = 7200;
    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    public String uploadFile(MultipartFile file, String folder) {
        if(file == null || file.isEmpty()){
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }
        validateUpload(file, folder);

        try{
            Map<?,?> params = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", folder.endsWith("/audios") ? "video" : "image"
            );

            Map<?, ?> uploadResutt = cloudinary.uploader().upload(file.getBytes(), params);
            return uploadResutt.get("secure_url").toString();
        }
        catch (IOException e){
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    public PrivatePdfUpload uploadPrivateClassPdf(MultipartFile file, String folder) {
        byte[] bytes = readAndValidateClassPdf(file, folder);
        String publicId = folder + "/" + UUID.randomUUID() + ".pdf";
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(bytes, ObjectUtils.asMap(
                    "public_id", publicId,
                    "resource_type", "raw",
                    "type", "private",
                    "use_filename", false,
                    "unique_filename", true,
                    "overwrite", false
            ));
            String secureUrl = String.valueOf(uploadResult.get("secure_url"));
            String storedPublicId = String.valueOf(uploadResult.get("public_id"));
            boolean privateRawAsset = "private".equals(uploadResult.get("type"))
                    && "raw".equals(uploadResult.get("resource_type"));
            if (!secureUrl.startsWith("https://res.cloudinary.com/") || storedPublicId.isBlank()
                    || !storedPublicId.startsWith(folder + "/") || !privateRawAsset) {
                if (secureUrl.startsWith("https://res.cloudinary.com/")) deleteFileByUrl(secureUrl);
                throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
            }
            return new PrivatePdfUpload(secureUrl, storedPublicId, bytes.length,
                    sanitizeFileName(file.getOriginalFilename()));
        } catch (IOException exception) {
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    public void deletePrivateClassPdf(String publicId) {
        if (publicId == null || !publicId.matches(
                "Resource/toeic-learning/classrooms/[A-Za-z0-9-]{1,64}/materials/[A-Fa-f0-9-]{36}\\.pdf")) {
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }
        destroyAsset(publicId, "raw", "private");
    }

    public PrivateMediaUpload uploadPrivateExamMedia(MultipartFile file, String folder) {
        validateUpload(file, folder);
        if (!folder.matches("Resource/toeic-learning/exams/[A-Za-z0-9_-]{1,100}/(audios|images)")) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        String resourceType = folder.endsWith("/audios") ? "video" : "image";
        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", folder, "resource_type", resourceType, "type", "authenticated",
                    "use_filename", false, "unique_filename", true, "overwrite", false
            ));
            String publicId = String.valueOf(result.get("public_id"));
            String format = String.valueOf(result.get("format"));
            String deliveryType = String.valueOf(result.get("type"));
            if (!"authenticated".equals(deliveryType) || !publicId.startsWith(folder + "/") || format.isBlank()) {
                if (!publicId.isBlank()) destroyAsset(publicId, resourceType, "authenticated");
                throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
            }
            PrivateDownload preview = createPrivateExamMediaDownload(publicId, format, resourceType);
            return new PrivateMediaUpload(preview.url(), publicId, format, deliveryType);
        } catch (IOException exception) {
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    public PrivateDownload createPrivateExamMediaDownload(String publicId, String format, String resourceType) {
        if (publicId == null || !publicId.matches("Resource/toeic-learning/exams/[A-Za-z0-9/_-]{1,180}")
                || format == null || !format.matches("[A-Za-z0-9]{1,12}")
                || !("image".equals(resourceType) || "video".equals(resourceType))) {
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }
        long expiresAt = Instant.now().getEpochSecond() + EXAM_MEDIA_DOWNLOAD_TTL_SECONDS;
        try {
            String url = cloudinary.privateDownload(publicId, format, ObjectUtils.asMap(
                    "resource_type", resourceType, "type", "authenticated", "attachment", false, "expires_at", expiresAt
            ));
            return new PrivateDownload(url, expiresAt);
        } catch (Exception exception) {
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    public void deletePrivateExamMedia(String publicId, String resourceType) {
        if (publicId == null || !publicId.matches("Resource/toeic-learning/exams/[A-Za-z0-9/_-]{1,180}")
                || !("image".equals(resourceType) || "video".equals(resourceType))) {
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }
        destroyAsset(publicId, resourceType, "authenticated");
    }

    private void destroyAsset(String publicId, String resourceType, String deliveryType) {
        try { cloudinary.uploader().destroy(publicId, ObjectUtils.asMap(
                "resource_type", resourceType, "type", deliveryType, "invalidate", true));
        } catch (Exception ignored) { log.warn("Cloudinary upload cleanup failed for an application-owned asset."); }
    }

    public record PrivateMediaUpload(String url, String publicId, String format, String deliveryType) { }

    public PrivateDownload createPrivateRawDownload(String publicId, String format) {
        if (publicId == null || publicId.isBlank() || publicId.length() > 512 || !"pdf".equalsIgnoreCase(format)) {
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }
        long expiresAt = Instant.now().getEpochSecond() + PRIVATE_DOWNLOAD_TTL_SECONDS;
        try {
            String url = cloudinary.privateDownload(publicId, "pdf", ObjectUtils.asMap(
                    "resource_type", "raw",
                    "type", "private",
                    "attachment", true,
                    "expires_at", expiresAt
            ));
            return new PrivateDownload(url, expiresAt);
        } catch (Exception exception) {
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    private byte[] readAndValidateClassPdf(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) throw new AppException(ErrorCode.FILE_NOT_FOUND);
        if (folder == null || folder.length() > 240 || !folder.matches("Resource/toeic-learning/classrooms/[A-Za-z0-9-]{1,64}/materials")
                || file.getSize() > MAX_CLASS_PDF_BYTES) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        try {
            byte[] bytes = file.getBytes();
            if (bytes.length < 10 || !startsWith(bytes, 0x25, 0x50, 0x44, 0x46, 0x2D)) {
                throw new AppException(ErrorCode.VALIDATION_ERROR);
            }
            int searchStart = Math.max(0, bytes.length - 2048);
            boolean hasEndMarker = false;
            byte[] endMarker = "%%EOF".getBytes(StandardCharsets.US_ASCII);
            for (int index = searchStart; index <= bytes.length - endMarker.length; index++) {
                boolean matches = true;
                for (int offset = 0; offset < endMarker.length; offset++) {
                    if (bytes[index + offset] != endMarker[offset]) { matches = false; break; }
                }
                if (matches) { hasEndMarker = true; break; }
            }
            if (!hasEndMarker) throw new AppException(ErrorCode.VALIDATION_ERROR);
            return bytes;
        } catch (IOException exception) {
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) return "Tai-lieu.pdf";
        String sanitized = fileName.replace('\\', '_').replace('/', '_').replaceAll("[\\p{Cntrl}]", "_").trim();
        if (sanitized.isBlank()) return "Tai-lieu.pdf";
        return sanitized.length() > 180 ? sanitized.substring(sanitized.length() - 180) : sanitized;
    }

    public record PrivatePdfUpload(String secureUrl, String publicId, long sizeBytes, String originalFileName) { }
    public record PrivateDownload(String url, long expiresAt) { }

    private void validateUpload(MultipartFile file, String folder) {
        if (folder == null || folder.length() > 240 || !folder.startsWith(APP_FOLDER_PREFIX)
                || !folder.matches("[A-Za-z0-9/_-]+") || folder.contains("..")
                || folder.contains("//") || folder.endsWith("/")) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }

        boolean audio = folder.endsWith("/audios");
        boolean image = folder.endsWith("/images") || folder.equals(APP_FOLDER_PREFIX + "avatars");
        if (audio == image) throw new AppException(ErrorCode.VALIDATION_ERROR);
        long sizeLimit = audio ? MAX_AUDIO_BYTES : MAX_IMAGE_BYTES;
        if (file.getSize() > sizeLimit) throw new AppException(ErrorCode.VALIDATION_ERROR);

        try {
            byte[] bytes = file.getBytes();
            if (audio) {
                if (!isMp3(bytes) && !isWav(bytes) && !isM4a(bytes)) {
                    throw new AppException(ErrorCode.VALIDATION_ERROR);
                }
            } else if (!isDecodableJpegOrPng(bytes)) {
                throw new AppException(ErrorCode.VALIDATION_ERROR);
            }
        } catch (IOException exception) {
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    private boolean isMp3(byte[] bytes) {
        int frameOffset = 0;
        if (startsWith(bytes, 0x49, 0x44, 0x33)) {
            if (bytes.length < 10) return false;
            int tagSize = ((bytes[6] & 0x7F) << 21) | ((bytes[7] & 0x7F) << 14)
                    | ((bytes[8] & 0x7F) << 7) | (bytes[9] & 0x7F);
            frameOffset = 10 + tagSize + ((bytes[5] & 0x10) != 0 ? 10 : 0);
        }
        for (int offset = frameOffset; offset + 4 <= bytes.length && offset < frameOffset + 4096; offset++) {
            int first = bytes[offset] & 0xFF;
            int second = bytes[offset + 1] & 0xFF;
            int third = bytes[offset + 2] & 0xFF;
            int fourth = bytes[offset + 3] & 0xFF;
            int version = (second >> 3) & 0x03;
            int layer = (second >> 1) & 0x03;
            int bitrateIndex = (third >> 4) & 0x0F;
            int sampleIndex = (third >> 2) & 0x03;
            if (first != 0xFF || (second & 0xE0) != 0xE0 || version == 1 || layer == 0
                    || bitrateIndex == 0 || bitrateIndex == 15 || sampleIndex == 3) continue;
            if ((fourth & 0x03) == 2) continue;
            return true;
        }
        return false;
    }

    private boolean isWav(byte[] bytes) {
        if (bytes.length < 44 || !asciiAt(bytes, 0, "RIFF") || !asciiAt(bytes, 8, "WAVE")) return false;
        long declaredSize = (bytes[4] & 0xFFL) | ((bytes[5] & 0xFFL) << 8)
                | ((bytes[6] & 0xFFL) << 16) | ((bytes[7] & 0xFFL) << 24);
        if (declaredSize + 8 > bytes.length || declaredSize < 36) return false;
        boolean hasFormat = false;
        boolean hasAudioData = false;
        int offset = 12;
        while (offset + 8 <= bytes.length && offset + 8 <= declaredSize + 8) {
            String chunk = new String(bytes, offset, 4, java.nio.charset.StandardCharsets.US_ASCII);
            long chunkSize = (bytes[offset + 4] & 0xFFL) | ((bytes[offset + 5] & 0xFFL) << 8)
                    | ((bytes[offset + 6] & 0xFFL) << 16) | ((bytes[offset + 7] & 0xFFL) << 24);
            long chunkEnd = offset + 8L + chunkSize;
            if (chunkEnd > bytes.length || chunkEnd > declaredSize + 8) return false;
            if ("fmt ".equals(chunk) && chunkSize >= 16) hasFormat = true;
            if ("data".equals(chunk) && chunkSize > 0) hasAudioData = true;
            offset = (int) (chunkEnd + (chunkSize & 1));
        }
        return hasFormat && hasAudioData;
    }

    private boolean isM4a(byte[] bytes) {
        if (bytes.length < 12 || !asciiAt(bytes, 4, "ftyp")) return false;
        String brand = new String(bytes, 8, 4, java.nio.charset.StandardCharsets.US_ASCII);
        return (brand.startsWith("M4A") || brand.startsWith("M4B")) && containsAudioHandler(bytes);
    }

    private boolean containsAudioHandler(byte[] bytes) {
        for (int offset = 4; offset <= bytes.length - 8; offset++) {
            if (!asciiAt(bytes, offset, "hdlr")) continue;
            int fullBoxVersionOffset = offset + 4;
            int handlerOffset = fullBoxVersionOffset + 8;
            if (handlerOffset + 4 <= bytes.length && asciiAt(bytes, handlerOffset, "soun")) return true;
        }
        return false;
    }

    private boolean isDecodableJpegOrPng(byte[] bytes) {
        boolean jpeg = startsWith(bytes, 0xFF, 0xD8, 0xFF);
        boolean png = startsWith(bytes, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
        if (!jpeg && !png) return false;
        try (ImageInputStream input = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            if (input == null) return false;
            Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) return false;
            ImageReader reader = readers.next();
            try {
                reader.setInput(input, true, true);
                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                if (width <= 0 || height <= 0 || width > 8000 || height > 8000
                        || (long) width * height > 20_000_000L) return false;
                var decoded = reader.read(0);
                if (decoded == null) return false;
                decoded.flush();
                return true;
            } finally {
                reader.dispose();
            }
        } catch (IOException | RuntimeException exception) {
            return false;
        }
    }

    private boolean startsWith(byte[] bytes, int... signature) {
        if (bytes.length < signature.length) return false;
        for (int index = 0; index < signature.length; index++) {
            if ((bytes[index] & 0xFF) != signature[index]) return false;
        }
        return true;
    }

    private boolean asciiAt(byte[] bytes, int offset, String value) {
        if (bytes.length < offset + value.length()) return false;
        for (int index = 0; index < value.length(); index++) {
            if (bytes[offset + index] != (byte) value.charAt(index)) return false;
        }
        return true;
    }

    public boolean deleteFileByUrl(String fileUrl) {
        String publicId = extractOwnedPublicId(fileUrl);
        if (publicId == null) return false;
        try {
            String resourceType = URI.create(fileUrl).getPath().split("/")[2];
            Map<?, ?> result = cloudinary.uploader().destroy(publicId,
                    ObjectUtils.asMap("resource_type", resourceType, "invalidate", true));
            return "ok".equals(result.get("result"));
        } catch (Exception exception) {
            log.warn("Cloudinary asset cleanup failed for an application-owned asset.");
            return false;
        }
    }

    private String extractOwnedPublicId(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return null;
        try {
            URI uri = URI.create(fileUrl);
            if (!"https".equalsIgnoreCase(uri.getScheme())
                    || !"res.cloudinary.com".equalsIgnoreCase(uri.getHost())
                    || uri.getUserInfo() != null || uri.getPort() != -1
                    || uri.getQuery() != null || uri.getFragment() != null) return null;

            String[] segments = uri.getPath().split("/");
            if (segments.length < 7 || !cloudName.equals(segments[1])) return null;
            String resourceType = segments[2];
            if (!"image".equals(resourceType) && !"video".equals(resourceType) && !"raw".equals(resourceType)) return null;
            int uploadIndex = -1;
            for (int index = 3; index < segments.length; index++) {
                if ("upload".equals(segments[index])) { uploadIndex = index; break; }
            }
            if (uploadIndex < 0 || uploadIndex + 2 >= segments.length) return null;

            int assetStart = uploadIndex + 1;
            while (assetStart < segments.length && !VERSION_SEGMENT.matcher(segments[assetStart]).matches()) assetStart++;
            if (assetStart + 1 >= segments.length) return null;
            assetStart++;
            String publicId = String.join("/", java.util.Arrays.copyOfRange(segments, assetStart, segments.length));
            if (!publicId.startsWith("Resource/toeic-learning/") || publicId.contains("..")) return null;
            if (!"raw".equals(resourceType)) {
                int extensionSeparator = publicId.lastIndexOf('.');
                if (extensionSeparator > publicId.lastIndexOf('/')) publicId = publicId.substring(0, extensionSeparator);
            }
            return publicId;
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

}
