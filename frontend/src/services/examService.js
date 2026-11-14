import apiClient from '../api/apiClient';

export const examService = {
  // GET /api/exam/list?numberPage=1&sizeOfPage=10&keyWord=...&sortBy=createdAt&direction=DESC&status=...&isVip=...
  getTests: async (numberPage = 1, sizeOfPage = 9, keyWord = '', sortBy = 'createdAt', direction = 'DESC', status = null, category = 'ALL', isVip = null) => {
    const params = {
      numberPage,
      sizeOfPage,
      ...(keyWord?.trim() ? { keyWord: keyWord.trim() } : {}),
      sortBy,
      direction,
      category,
    };
    if (status) {
      params.status = status;
    }
    if (isVip !== null && isVip !== undefined && isVip !== '' && isVip !== 'ALL') {
      params.isVip = isVip === true || isVip === 'VIP' || isVip === 'true';
    }
    const response = await apiClient.get('/exam/list', { params });
    return response.data; // ApiResponse<PageResponse<Test>>
  },

  getAdminTests: async (numberPage = 1, sizeOfPage = 9, keyWord = '', sortBy = 'createdAt', direction = 'DESC', status = 'PUBLISHED') => {
    const response = await apiClient.get('/exam/admin/list', {
      params: { numberPage, sizeOfPage, keyWord: keyWord?.trim() || '', sortBy, direction, status },
    });
    return response.data;
  },

  // GET /api/exam/{testID}
  getTestDetail: async (testId) => {
    const response = await apiClient.get(`/exam/${testId}`);
    return response.data; // ApiResponse<Test>
  },

  getDictationData: async (testId) => (
    await apiClient.get(`/exam/${testId}/dictation`)
  ).data,

  getTestAccess: async (testId) => (await apiClient.get(`/exam/${testId}/access`)).data,

  getAdminTestDetail: async (testId) => {
    const response = await apiClient.get(`/exam/admin/${testId}`);
    return response.data;
  },

  getClassroomTests: async (classroomId, numberPage = 1, sizeOfPage = 50) => (
    await apiClient.get(`/exam/classrooms/${classroomId}/tests`, { params: { numberPage, sizeOfPage } })
  ).data,
  getClassroomTestDetail: async (classroomId, testId) => (
    await apiClient.get(`/exam/classrooms/${classroomId}/tests/${testId}`)
  ).data,
  createClassroomTest: async (classroomId, payload) => (
    await apiClient.post(`/exam/classrooms/${classroomId}/tests`, payload)
  ).data,
  updateClassroomTest: async (classroomId, testId, payload) => (
    await apiClient.put(`/exam/classrooms/${classroomId}/tests/${testId}`, payload)
  ).data,
  publishClassroomTest: async (classroomId, testId) => (
    await apiClient.patch(`/exam/classrooms/${classroomId}/tests/${testId}/publish`)
  ).data,
  deleteClassroomTest: async (classroomId, testId) => (
    await apiClient.delete(`/exam/classrooms/${classroomId}/tests/${testId}`)
  ).data,
  getAssignableClassroomTests: async (classroomId, numberPage = 1, sizeOfPage = 100) => (
    await apiClient.get(`/exam/classrooms/${classroomId}/tests/assignable`, { params: { numberPage, sizeOfPage } })
  ).data,

  submitExam: async (payload) => {
    const response = await apiClient.post('/exam/submit', payload);
    return response.data;
  },

  startExamSession: async (payload) => (await apiClient.post('/exam/sessions', payload)).data,
  saveExamSessionAnswers: async (sessionId, answers) => (
    await apiClient.patch(`/exam/sessions/${sessionId}/answers`, { answers })
  ).data,
  cancelExamSession: async (sessionId) => (
    await apiClient.delete(`/exam/sessions/${sessionId}`)
  ).data,

  getTestHistory: async (testId) => {
    const response = await apiClient.get('/exam/history', { params: testId ? { testId } : {} });
    return response.data;
  },

  getTestResultDetail: async (resultId) => {
    const response = await apiClient.get(`/exam/results/${resultId}`);
    return response.data;
  },

  getAssignmentResultDetail: async (resultId) => {
    const response = await apiClient.get(`/exam/assignment-results/${resultId}`);
    return response.data;
  },

  // GET /api/exam/{testID}/parts/{partID}
  getTestPart: async (testId, partId) => {
    const response = await apiClient.get(`/exam/${testId}/parts/${partId}`);
    return response.data; // ApiResponse<PartForUserResponseDTO>
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

  updateTestMetadata: async (testId, requestData) => {
    const response = await apiClient.patch(`/exam/update/${testId}/metadata`, requestData);
    return response.data;
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
    return response.data; // ApiResponse<'DELETED' | 'ARCHIVED'>
  },

  // Test Comments
  getTestComments: async (testId) => {
    const response = await apiClient.get(`/exam/${testId}/comments`);
    return response.data; // ApiResponse<CommentResponseDTO[]>
  },

  createTestComment: async (testId, content) => {
    const response = await apiClient.post(`/exam/${testId}/comments`, { content });
    return response.data; // ApiResponse<CommentResponseDTO>
  },

  updateTestComment: async (commentId, content) => {
    const response = await apiClient.put(`/exam/comments/${commentId}`, { content });
    return response.data; // ApiResponse<CommentResponseDTO>
  },

  deleteTestComment: async (commentId) => {
    const response = await apiClient.delete(`/exam/comments/${commentId}`);
    return response.data; // ApiResponse<String>
  },
};

