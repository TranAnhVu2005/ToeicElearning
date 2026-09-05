import apiClient from '../api/apiClient';

export const userService = {
  // GET /api/user/me
  getProfile: async () => {
    const response = await apiClient.get('/user/me');
    return response.data; // ApiResponse<UserResponseDTO>
  },

  // PATCH /api/user/updateprofile
  updateProfile: async (updateData) => {
    // updateData: { userName, userNumberphone, userAvatar }
    const response = await apiClient.patch('/user/updateprofile', updateData);
    return response.data; // ApiResponse<UserResponseDTO>
  },

  // POST /api/user/changepassword
  changePassword: async (passwordData) => {
    // passwordData: { currentPassword, newPassword }
    const response = await apiClient.post('/user/changepassword', passwordData);
    return response.data; // ApiResponse<String>
  },
};
