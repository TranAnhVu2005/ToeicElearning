import apiClient from '../api/apiClient';

export const adminService = {
  // GET /api/admin/users?numberPage=1&sizeOfPage=10&keyWord=...&sortBy=createdAt&direction=DESC
  getUsers: async (numberPage = 1, sizeOfPage = 10, keyWord = '', sortBy = 'createdAt', direction = 'DESC') => {
    const response = await apiClient.get('/admin/users', {
      params: {
        numberPage,
        sizeOfPage,
        ...(keyWord?.trim() ? { keyWord: keyWord.trim() } : {}),
        sortBy,
        direction,
      },
    });
    return response.data; // ApiResponse<PageResponse<AdminResponseDTO>>
  },

  // PATCH /api/admin/changestatus
  // Gửi cả 'isLocked' và 'locked' để tương thích cả trường hợp Jackson map theo getter/setter
  changeUserStatus: async (userId, isLocked) => {
    const targetStatus = Boolean(isLocked);
    const response = await apiClient.patch('/admin/changestatus', {
      userId,
      isLocked: targetStatus,
      locked: targetStatus,
    });
    return response.data; // ApiResponse<AdminResponseDTO>
  },

  getPayments: async (params = {}) => (await apiClient.get('/admin/payments', { params })).data,
  getPaymentDetails: async (paymentId) => (await apiClient.get(`/admin/payments/${paymentId}`)).data,

  getMetricsOverview: async () => (await apiClient.get('/admin/metrics/overview')).data,

  getDailyTestMetrics: async (from, to) => (await apiClient.get('/admin/metrics/tests', { params: { from, to } })).data,

  getAuditEvents: async (page = 1, size = 20) => (await apiClient.get('/admin/audit-events', { params: { page, size } })).data,
};
