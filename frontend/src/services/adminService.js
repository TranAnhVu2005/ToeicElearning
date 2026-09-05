import apiClient from '../api/apiClient';

export const adminService = {
  // GET /api/admin/users?numberPage=1&sizeOfPage=10&keyWord=...
  getUsers: async (numberPage = 1, sizeOfPage = 10, keyWord = '') => {
    const response = await apiClient.get('/admin/users', {
      params: {
        numberPage,
        sizeOfPage,
        ...(keyWord.trim() ? { keyWord: keyWord.trim() } : {}),
      },
    });
    return response.data; // ApiResponse<PageResponse<UserResponseAdminDTO>>
  },

  // PATCH /api/admin/changestatus
  changeUserStatus: async (userId, userStatus) => {
    // userStatus: boolean (true = active, false = locked)
    const response = await apiClient.patch('/admin/changestatus', {
      userId,
      userStatus,
    });
    return response.data; // ApiResponse<Void>
  },
};
