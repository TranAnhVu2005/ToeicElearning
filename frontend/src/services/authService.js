import apiClient from '../api/apiClient';

export const authService = {
  // POST /api/auth/login
  // credentials: { emailOrPhone, userPassword }
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', {
      emailOrPhone: credentials.emailOrPhone?.trim(),
      userPassword: credentials.userPassword,
    });
    return response.data; // ApiResponse<AuthResponseDTO>
  },

  // POST /api/auth/register
  // userData: { userName, userEmail, userNumberphone, userPassword, userAvatar }
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', {
      userName: userData.userName?.trim(),
      userEmail: userData.userEmail?.trim().toLowerCase(),
      userNumberphone: userData.userNumberphone?.trim(),
      userPassword: userData.userPassword,
      userAvatar: userData.userAvatar || null,
    });
    return response.data; // ApiResponse<AuthResponseDTO>
  },
};
