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
