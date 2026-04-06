import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('chat_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout'),
  profile: () => api.get('/auth/profile'),
  getUsers: (search = '') => api.get('/auth/users', { params: { search } }),
}

export const chatApi = {
  getChats: () => api.get('/chats'),
  getMessages: (chatId, params) => api.get(`/chats/${chatId}/messages`, { params }),
  createChat: (payload) => api.post('/chats', payload),
  sendMessage: (chatId, payload) => api.post(`/chats/${chatId}/messages`, payload),
}

export const statsApi = {
  getStats: () => api.get('/stats'),
}

export const usersApi = {
  getAll: (search = '') => api.get('/users', { params: { search } }),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (payload) => api.put('/users/profile', payload),
  updatePassword: (payload) => api.put('/users/password', payload),
  deleteAccount: () => api.delete('/users/me'),
}

export const analyticsApi = {
  getMessageStats: (days) => api.get('/analytics/messages', { params: { days } }),
  getUserStats: (days) => api.get('/analytics/users', { params: { days } }),
  getTopUsers: () => api.get('/analytics/top-users'),
}

export const mediaApi = {
  getAll: () => api.get('/media'),
}
