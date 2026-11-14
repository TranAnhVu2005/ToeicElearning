package com.ctu_cit_nienLuanNganh.toeicLearning.module.ai;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.ai.dto.AiChatResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.ai.request.AiChatRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.ai.service.AiAssistantService;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.service.LoginRateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
