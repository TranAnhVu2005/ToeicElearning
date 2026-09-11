import apiClient from '../api/apiClient';

/**
 * Upload audio hoặc hình ảnh đề thi lên Backend API
 * Endpoint: POST /api/media/upload
 * 
 * @param {File} file - File nhị phân từ input máy tính
 * @param {string} testTitle - Tiêu đề bài thi để tự động gom nhóm thư mục
 * @param {'audio' | 'image'} type - Phân loại tệp tin
 * @param {string} [oldUrl] - Đường link cũ cần xóa khỏi Cloudinary (nếu có)
 * @returns {Promise<string>} - Đường link URL hoàn chỉnh của file trên Cloudinary
 */
export const uploadMediaFile = async (file, testTitle = 'general', type = 'audio', oldUrl = null) => {
  if (!file) {
    throw new Error('Chưa có file nào được chọn.');
  }

  // Chuẩn hóa tên đề thành slug thư mục: ví dụ "ETS TOEIC 2026 - Test 01" -> "Resource/toeic-learning/exams/ets-2026-test-01/audios"
  const safeFolderName = testTitle
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const folder = `Resource/toeic-learning/exams/${safeFolderName || 'common'}/${type}s`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  if (oldUrl && typeof oldUrl === 'string' && oldUrl.includes('cloudinary.com')) {
    formData.append('oldUrl', oldUrl.trim());
  }

  const response = await apiClient.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (response.data && response.data.code === 1000 && response.data.data?.url) {
    return response.data.data.url;
  }

  throw new Error(response.data?.message || 'Không thể tải file lên máy chủ.');
};

/**
 * Upload ảnh đại diện (Avatar) người dùng lên Cloudinary
 * Tự động gom vào thư mục Resource/toeic-learning/avatars và xóa avatar cũ nếu có
 * 
 * @param {File} file - File ảnh từ máy tính
 * @param {string} [oldAvatarUrl] - URL avatar cũ của người dùng
 * @returns {Promise<string>} - URL avatar mới
 */
export const uploadAvatar = async (file, oldAvatarUrl = null) => {
  if (!file) {
    throw new Error('Chưa có file nào được chọn.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'Resource/toeic-learning/avatars');
  if (oldAvatarUrl && typeof oldAvatarUrl === 'string' && oldAvatarUrl.includes('cloudinary.com')) {
    formData.append('oldUrl', oldAvatarUrl.trim());
  }

  const response = await apiClient.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (response.data && response.data.code === 1000 && response.data.data?.url) {
    return response.data.data.url;
  }

  throw new Error(response.data?.message || 'Không thể tải ảnh đại diện lên máy chủ.');
};
