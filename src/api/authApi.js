import axiosClient from './axiosClient';

export const authApi = {
  register: (data) => axiosClient.post('/api/auth/register', data),
  login:    (data) => axiosClient.post('/api/auth/login', data),
  refresh:  (refreshToken) => axiosClient.post('/api/auth/refresh', { refreshToken }),
  logout:   (refreshToken) => axiosClient.post('/api/auth/logout', { refreshToken }),
  getMe:    () => axiosClient.get('/api/users/me'),
};