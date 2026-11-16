package com.ctu_cit_nienLuanNganh.toeicLearning.module.ai;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.ai.dto.AiChatResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.ai.request.AiChatRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.ai.service.AiAssistantService;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.service.LoginRateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiAssistantController {

    private final AiAssistantService aiAssistantService;
    private final LoginRateLimitService rateLimitService;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<AiChatResponseDTO>> chat(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody AiChatRequest request,
            HttpServletRequest httpRequest
    ) {
        String userId = currentUser == null ? null : currentUser.getId();
        String ip = httpRequest == null ? null : httpRequest.getRemoteAddr();
        rateLimitService.checkAllowed("ai-chat", ip, userId, 60, userId == null ? 0 : 45);
        rateLimitService.recordAttempt("ai-chat", ip, userId, 60, userId == null ? 0 : 45);

        AiChatResponseDTO response = aiAssistantService.chat(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Phản hồi từ Trợ lý AI", response));
    }

    @PostMapping(value = "/voice-chat", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AiChatResponseDTO>> voiceChat(
            @AuthenticationPrincipal User currentUser,
            @RequestParam("audio") MultipartFile audioFile,
            @RequestParam(value = "resultId", required = false) String resultId,
            @RequestParam(value = "questionId", required = false) String questionId,
            @RequestParam(value = "questionNumber", required = false) Integer questionNumber,
            @RequestParam(value = "pageContext", required = false) String pageContext,
            @RequestParam(value = "historyJson", required = false) String historyJson,
            @RequestParam(value = "languageHint", required = false) String languageHint,
            @RequestParam(value = "clientTranscript", required = false) String clientTranscript,
            HttpServletRequest httpRequest
    ) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        if (Boolean.TRUE.equals(currentUser.getIsLocked())) {
            throw new AppException(ErrorCode.USER_ACCOUNT_LOCKED);
        }
        String ip = httpRequest == null ? null : httpRequest.getRemoteAddr();
        rateLimitService.checkAllowed("ai-voice-chat", ip, currentUser.getId(), 30, 20);
        rateLimitService.recordAttempt("ai-voice-chat", ip, currentUser.getId(), 30, 20);

        AiChatResponseDTO response = aiAssistantService.voiceChat(
                currentUser,
                audioFile,
                resultId,
                questionId,
                questionNumber,
                pageContext,
                historyJson,
                languageHint,
                clientTranscript
        );
        return ResponseEntity.ok(ApiResponse.success("Phản hồi giọng nói từ Trợ lý AI", response));
    }

    @PostMapping(value = "/tts", produces = "audio/mpeg")
    public ResponseEntity<byte[]> synthesizeSpeech(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, String> body,
            HttpServletRequest httpRequest
    ) {
        String userId = currentUser == null ? null : currentUser.getId();
        String ip = httpRequest == null ? null : httpRequest.getRemoteAddr();
        rateLimitService.checkAllowed("ai-tts", ip, userId, 90, userId == null ? 0 : 60);
        rateLimitService.recordAttempt("ai-tts", ip, userId, 90, userId == null ? 0 : 60);

        String text = body == null ? null : body.get("text");
        String lang = body == null ? null : body.get("lang");
        byte[] audioBytes = aiAssistantService.synthesizeSpeech(text, lang);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "audio/mpeg")
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(audioBytes);
    }
}
