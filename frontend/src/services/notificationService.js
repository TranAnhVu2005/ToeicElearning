import apiClient from '../api/apiClient';

export const notificationService = {
  getMine: async ({ unreadOnly = false, page = 1, size = 20 } = {}) => (await apiClient.get('/notifications/me', { params: { unreadOnly, page, size } })).data,
  getUnreadCount: async () => (await apiClient.get('/notifications/me/unread-count')).data,
  markRead: async (notificationId) => (await apiClient.patch(`/notifications/${notificationId}/read`)).data,
  markAllRead: async () => (await apiClient.patch('/notifications/read-all')).data,
};
