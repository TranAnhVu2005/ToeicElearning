package com.ctu_cit_nienLuanNganh.toeicLearning.module.ai.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.ai.dto.AiChatResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.ai.request.AiChatRequest;

public interface AiAssistantService {
    AiChatResponseDTO chat(User currentUser, AiChatRequest request);
}
