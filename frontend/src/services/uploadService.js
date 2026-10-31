import apiClient from '../api/apiClient';

/**
 * Upload audio hoặc hình ảnh đề thi lên Backend API
 * Endpoint: POST /api/media/upload
 * 
 * @param {File} file - File nhị phân từ input máy tính
 * @param {string} testTitle - Tiêu đề bài thi để tự động gom nhóm thư mục
 * @param {'audio' | 'image'} type - Phân loại tệp tin
 * @returns {Promise<string>} - Đường link URL hoàn chỉnh của file trên Cloudinary
 */
export const uploadMediaFile = async (file, testTitle = 'general', type = 'audio', privateExamMedia = false) => {
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
  if (privateExamMedia) formData.append('privateExamMedia', 'true');
  const response = await apiClient.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (response.data && response.data.code === 1000 && response.data.data?.url) {
    return response.data.data;
  }

  throw new Error(response.data?.message || 'Không thể tải file lên máy chủ.');
};

/**
 * Upload ảnh đại diện (Avatar) người dùng lên Cloudinary
 * Tự động gom vào thư mục Resource/toeic-learning/avatars
 * 
 * @param {File} file - File ảnh từ máy tính
 * @returns {Promise<string>} - URL avatar mới
 */
export const uploadAvatar = async (file) => {
  if (!file) {
    throw new Error('Chưa có file nào được chọn.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'Resource/toeic-learning/avatars');
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
