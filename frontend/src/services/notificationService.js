import apiClient from '../api/apiClient';

const notifySubscribers = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('toeic:notifications-updated'));
  }
};

export const notificationService = {
  getMine: async ({ unreadOnly = false, category = 'ALL', page = 1, size = 15 } = {}) =>
    (await apiClient.get('/notifications/me', { params: { unreadOnly, category, page, size } })).data,

  // Alias giữ tương thích ngược
  getMyNotifications: async (params = {}) =>
    notificationService.getMine(params),

  getUnreadCount: async () =>
    (await apiClient.get('/notifications/me/unread-count')).data,

  markRead: async (notificationId) => {
    const res = (await apiClient.patch(`/notifications/${notificationId}/read`)).data;
    notifySubscribers();
    return res;
  },

  markAsRead: async (notificationId) =>
    notificationService.markRead(notificationId),

  markAllRead: async () => {
    const res = (await apiClient.patch('/notifications/read-all')).data;
    notifySubscribers();
    return res;
  },

  markAllAsRead: async () =>
    notificationService.markAllRead(),

  deleteNotification: async (notificationId) => {
    const res = (await apiClient.delete(`/notifications/${notificationId}`)).data;
    notifySubscribers();
    return res;
  },

  deleteReadNotifications: async () => {
    const res = (await apiClient.delete('/notifications/read')).data;
    notifySubscribers();
    return res;
  },
};
