import apiClient from '../api/apiClient';

export const classroomService = {
  getMine: async () => (await apiClient.get('/classrooms/mine')).data,
  create: async (className, description) => (await apiClient.post('/classrooms', { className, description })).data,
  update: async (classroomId, className, description) =>
    (await apiClient.put(`/classrooms/${classroomId}`, { className, description })).data,
  rotateJoinCode: async (classroomId) => (await apiClient.post(`/classrooms/${classroomId}/join-code/rotate`)).data,
  join: async (classCode) => (await apiClient.post('/classrooms/join', { classCode })).data,
  getMembers: async (classroomId, status) => (await apiClient.get(`/classrooms/${classroomId}/members`, {
    params: status ? { status } : {},
  })).data,
  getMaterials: async (classroomId) => (await apiClient.get(`/classrooms/${classroomId}/materials`)).data,
  uploadMaterial: async (classroomId, title, file) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    return (await apiClient.post(`/classrooms/${classroomId}/materials`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  },
  getMaterialDownloadLink: async (classroomId, materialId) => (
    await apiClient.get(`/classrooms/${classroomId}/materials/${materialId}/download`)
  ).data,
  hideMaterial: async (classroomId, materialId) => (
    await apiClient.delete(`/classrooms/${classroomId}/materials/${materialId}`)
  ).data,
  changeMemberStatus: async (classroomId, memberId, status) => (
    await apiClient.patch(`/classrooms/${classroomId}/members/${memberId}`, { status })
  ).data,
  getAssignments: async (classroomId) => (await apiClient.get(`/classrooms/${classroomId}/assignments`)).data,
  getAssignableTests: async (classroomId) => (await apiClient.get(`/exam/classrooms/${classroomId}/tests/assignable`, { params: { numberPage: 1, sizeOfPage: 100 } })).data,
  createAssignment: async (classroomId, payload) => (await apiClient.post(`/classrooms/${classroomId}/assignments`, payload)).data,
  updateAssignment: async (assignmentId, payload) => (await apiClient.patch(`/classrooms/assignments/${assignmentId}`, payload)).data,
  archiveAssignment: async (assignmentId) => (await apiClient.delete(`/classrooms/assignments/${assignmentId}`)).data,
  getAssignmentSubmissions: async (assignmentId, sortBy = 'name', direction = 'ASC') => (
    await apiClient.get(`/classrooms/assignments/${assignmentId}/submissions`, { params: { sortBy, direction } })
  ).data,
  getAssignmentSummary: async (assignmentId) => (
    await apiClient.get(`/classrooms/assignments/${assignmentId}/summary`)
  ).data,
  addAssignmentFeedback: async (resultId, comment) => (
    await apiClient.patch(`/classrooms/assignments/submissions/${resultId}/feedback`, { comment })
  ).data,
};
