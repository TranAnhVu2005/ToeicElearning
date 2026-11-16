import apiClient from '../api/apiClient';

export const aiService = {
  /**
   * POST /api/ai/chat
   * @param {Object} payload
   * @param {string} payload.message
   * @param {string} [payload.resultId]
   * @param {string} [payload.questionId]
   * @param {number} [payload.questionNumber]
   * @param {string} [payload.pageContext]
   * @param {Array<{role: string, content: string}>} [payload.history]
   */
  chat: async (payload) => {
    const response = await apiClient.post('/ai/chat', payload);
    return response.data; // ApiResponse<AiChatResponseDTO>
  },

  /**
   * POST /api/ai/voice-chat (Authenticated multipart/form-data)
   * @param {Object} payload
   * @param {Blob} payload.audioBlob
   * @param {string} [payload.fileName]
   * @param {string} [payload.resultId]
   * @param {string} [payload.questionId]
   * @param {number} [payload.questionNumber]
   * @param {string} [payload.pageContext]
   * @param {Array<{role: string, content: string}>} [payload.history]
   * @param {'vi'|'en'|'auto'} [payload.languageHint]
   */
  voiceChat: async ({
    audioBlob,
    fileName = 'voice-question.wav',
    resultId,
    questionId,
    questionNumber,
    pageContext,
    history,
    languageHint = 'auto',
    clientTranscript = '',
  }) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, fileName);
    if (resultId) formData.append('resultId', String(resultId));
    if (questionId) formData.append('questionId', String(questionId));
    if (questionNumber !== undefined && questionNumber !== null) {
      formData.append('questionNumber', String(questionNumber));
    }
    if (pageContext) formData.append('pageContext', String(pageContext));
    if (Array.isArray(history) && history.length > 0) {
      formData.append('historyJson', JSON.stringify(history));
    }
    if (languageHint) {
      formData.append('languageHint', String(languageHint));
    }
    if (clientTranscript && String(clientTranscript).trim()) {
      formData.append('clientTranscript', String(clientTranscript).trim());
    }

    const response = await apiClient.post('/ai/voice-chat', formData, {
      timeout: 35000,
    });
    return response.data; // ApiResponse<AiChatResponseDTO>
  },

  /**
   * POST /api/ai/tts -> audio/mpeg Blob
   * @param {Object} payload
   * @param {string} payload.text
   * @param {'vi'|'en'} [payload.lang]
   */
  synthesizeSpeech: async ({ text, lang = 'vi' }) => {
    const response = await apiClient.post(
      '/ai/tts',
      { text, lang },
      {
        responseType: 'blob',
        timeout: 15000,
      }
    );
    return response.data;
  },
};

export const openAiAssistant = (detail = {}) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('toeic:open-ai-assistant', { detail }));
  }
};

export const syncAiExamResultContext = (result = null) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('toeic:sync-ai-exam-result', { detail: { result } }));
  }
};
