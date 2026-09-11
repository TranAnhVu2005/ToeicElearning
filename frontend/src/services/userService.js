import apiClient from '../api/apiClient';

export const userService = {
  // GET /api/user/me
  getProfile: async () => {
    const response = await apiClient.get('/user/me');
    return response.data; // ApiResponse<UserResponseDTO>
  },

  // PATCH /api/user/updateprofile
  // Hỗ trợ cả FormData (chứa file nhị phân) và Object thông thường
  updateProfile: async (updateData) => {
    let payload;
    if (updateData instanceof FormData) {
      payload = updateData;
    } else {
      payload = new FormData();
      if (updateData.userName) payload.append('userName', updateData.userName.trim());
      if (updateData.userEmail) payload.append('userEmail', updateData.userEmail.trim().toLowerCase());
      if (updateData.userNumberphone) payload.append('userNumberphone', updateData.userNumberphone.trim());
      
      // Nếu có file ảnh mới từ thiết bị
      if (updateData.file) {
        payload.append('file', updateData.file);
      }
    }

    const response = await apiClient.patch('/user/updateprofile', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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
