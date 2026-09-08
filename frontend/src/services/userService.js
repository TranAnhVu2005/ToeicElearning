import apiClient from '../api/apiClient';

export const userService = {
  // GET /api/user/me
  getProfile: async () => {
    const response = await apiClient.get('/user/me');
    return response.data; // ApiResponse<UserResponseDTO>
  },

  // PATCH /api/user/updateprofile
  // updateData: { userName, userEmail, userNumberphone, userAvatar }
  updateProfile: async (updateData) => {
    const response = await apiClient.patch('/user/updateprofile', {
      userName: updateData.userName?.trim(),
      userEmail: updateData.userEmail?.trim().toLowerCase(),
      userNumberphone: updateData.userNumberphone?.trim(),
      userAvatar: updateData.userAvatar,
    });
    return response.data; // ApiResponse<UserResponseDTO>
  },

  // POST /api/user/changepassword
  // passwordData: { oldUserPassword, newUserPassword }
  changePassword: async (passwordData) => {
    const response = await apiClient.post('/user/changepassword', {
      oldUserPassword: passwordData.oldUserPassword,
      newUserPassword: passwordData.newUserPassword,
    });
    return response.data; // ApiResponse<Void>
  },
};
