import apiClient from '../api/apiClient';

export const authService = {
  // POST /api/auth/login
  login: async (credentials) => {
    // credentials: { userEmail, userPassword }
    const response = await apiClient.post('/auth/login', credentials);
    return response.data; // ApiResponse<AuthResponseDTO>
  },

  // POST /api/auth/register
  register: async (userData) => {
    // userData: { userName, userEmail, userNumberphone, userPassword }
    const response = await apiClient.post('/auth/register', userData);
    return response.data; // ApiResponse<AuthResponseDTO>
  },
};
