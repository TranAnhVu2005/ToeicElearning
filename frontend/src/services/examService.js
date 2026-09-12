import apiClient from '../api/apiClient';

export const examService = {
  // GET /api/exam/list?numberPage=1&sizeOfPage=10&keyWord=...&sortBy=createdAt&direction=DESC&status=...
  getTests: async (numberPage = 1, sizeOfPage = 9, keyWord = '', sortBy = 'createdAt', direction = 'DESC', status = null) => {
    const params = {
      numberPage,
      sizeOfPage,
      ...(keyWord?.trim() ? { keyWord: keyWord.trim() } : {}),
      sortBy,
      direction,
    };
    if (status) {
      params.status = status;
    }
    const response = await apiClient.get('/exam/list', { params });
    return response.data; // ApiResponse<PageResponse<Test>>
  },

  // GET /api/exam/{testID}
  getTestDetail: async (testId) => {
    const response = await apiClient.get(`/exam/${testId}`);
    return response.data; // ApiResponse<Test>
  },

  // POST /api/exam/create
  createTest: async (requestData) => {
    const response = await apiClient.post('/exam/create', requestData);
    return response.data; // ApiResponse<Void>
  },

  // PUT /api/exam/update/{testID}
  updateTest: async (testId, requestData) => {
    const response = await apiClient.put(`/exam/update/${testId}`, requestData);
    return response.data; // ApiResponse<Void>
  },

  // PATCH /api/exam/{testID}/publish - Xuất bản đề thi (chuyển sang PUBLISHED)
  publishTest: async (testId) => {
    const response = await apiClient.patch(`/exam/${testId}/publish`);
    return response.data; // ApiResponse<Void>
  },

  // PATCH /api/exam/{testID}/draft - Thu hồi đề thi về bản nháp (chuyển sang DRAFT)
  draftTest: async (testId) => {
    const response = await apiClient.patch(`/exam/${testId}/draft`);
    return response.data; // ApiResponse<Void>
  },

  // DELETE /api/exam/delete/{testID}
  deleteTest: async (testId) => {
    const response = await apiClient.delete(`/exam/delete/${testId}`);
    return response.data; // ApiResponse<Void>
  },
};

