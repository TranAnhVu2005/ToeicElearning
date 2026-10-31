import apiClient from '../api/apiClient';

export const vipPurchaseService = {
  checkout: async (testId) => (await apiClient.post('/payments/vip/checkout', { testId })).data,
};
