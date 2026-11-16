package com.ctu_cit_nienLuanNganh.toeicLearning.module.ai.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.ai.dto.AiChatResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.ai.request.AiChatRequest;
import org.springframework.web.multipart.MultipartFile;

public interface AiAssistantService {
    AiChatResponseDTO chat(User currentUser, AiChatRequest request);

    AiChatResponseDTO voiceChat(
            User currentUser,
            MultipartFile audioFile,
            String resultId,
            String questionId,
            Integer questionNumber,
            String pageContext,
            String historyJson,
            String languageHint,
            String clientTranscript
    );

    byte[] synthesizeSpeech(String text, String languageHint);
}
