import axiosClient from './axiosClient';

export const taskApi = {
  create:       (data)               => axiosClient.post('/api/tasks', data),
  getById:      (id)                 => axiosClient.get(`/api/tasks/${id}`),
  getMyTasks:   (params)             => axiosClient.get('/api/tasks/my', { params }),
  update:       (id, data)           => axiosClient.put(`/api/tasks/${id}`, data),
  assign:       (id, assignedToId)   => axiosClient.patch(`/api/tasks/${id}/assign`, { assignedToId }),
  updateStatus: (id, status)         => axiosClient.patch(`/api/tasks/${id}/status`, { status }),
  delete:       (id)                 => axiosClient.delete(`/api/tasks/${id}`),
};

export const dashboardApi = {
  getData: () => axiosClient.get('/api/dashboard'),
};

export const userApi = {
  getAll: () => axiosClient.get('/api/users'),
};