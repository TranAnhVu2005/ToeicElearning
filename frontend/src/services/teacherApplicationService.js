import apiClient from '../api/apiClient';

export const teacherApplicationService = {
  apply: async (statement) => (await apiClient.post('/teacher-applications', { statement })).data,
  getMine: async () => (await apiClient.get('/teacher-applications/me')).data,
  getPayments: async (transactionReference) => (await apiClient.get(`/payments/me/${encodeURIComponent(transactionReference)}`)).data,
  listPayments: async ({ page = 1, size = 10 } = {}) => (await apiClient.get('/payments/me', { params: { page, size } })).data,
  list: async ({ status = '', page = 1, size = 20 } = {}) => (await apiClient.get('/admin/teacher-applications', {
    params: { page, size, ...(status ? { status } : {}) },
  })).data,
  approve: async (id) => (await apiClient.patch(`/admin/teacher-applications/${id}/approve`)).data,
  reject: async (id, reason) => (await apiClient.patch(`/admin/teacher-applications/${id}/reject`, { reason })).data,
};
