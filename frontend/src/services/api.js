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
  // Returns { data: { users } }
  getUsers: (search = '') => api.get('/auth/users', { params: { search } }),
}

export const chatApi = {
  getChats: () => api.get('/chats'),
  getMessages: (chatId, params) => api.get(`/chats/${chatId}/messages`, { params }),
  createChat: (payload) => api.post('/chats', payload),
  sendMessage: (chatId, payload) => api.post(`/chats/${chatId}/messages`, payload),
  searchMessages: (query, limit = 20) => api.get('/chats/search', { params: { q: query, limit } }),
  // Direct message helpers
  getDirectMessages: (userId) => api.get(`/chats/user/${userId}/messages`),
  sendDirectMessage: (userId, payload) => api.post(`/chats/user/${userId}/messages`, payload),
}

export const statsApi = {
  getStats: () => api.get('/stats'),
}

export const usersApi = {
  // Returns { data: { users } }
  getAll: (search = '') => api.get('/users', { params: { search } }),
  // Returns { data: { users } }
  searchUsers: (query) => api.get('/users', { params: { search: query } }),
  // Returns { data: { user, friendStatus } }
  getById: (id) => api.get(`/users/${id}`),
  getUserProfile: (id) => api.get(`/users/${id}`),
  // Returns { data: { user } }
  updateProfile: (payload) => api.put('/users/profile', payload),
  updatePassword: (payload) => api.put('/users/password', payload),
  deleteAccount: () => api.delete('/users/me'),

  // Avatar / banner
  uploadAvatar: (formData) =>
    api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadBanner: (formData) =>
    api.post('/users/banner', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  getFriendsList: () => api.get('/users/friends'),
  getFriendSuggestions: () => api.get('/users/suggestions'),
  // Friend requests — returns { data: { requests } }
  getFriendRequests: () => api.get('/users/friend-requests'),
  sendFriendRequest: (userId) => api.post(`/users/${userId}/friend-request`),
  acceptFriendRequest: (userId) => api.post(`/users/${userId}/friend-request/accept`),
  rejectFriendRequest: (userId) => api.post(`/users/${userId}/friend-request/reject`),

  // Flag message — fixed URL (no chatId required)
  flagMessage: (messageId, reason) =>
    api.post(`/chats/messages/${messageId}/flag`, { reason }),

  // Admin
  getFlaggedMessages: () => api.get('/admin/flagged-messages'),
  approveFlaggedMessage: (flagId) => api.post(`/admin/flagged-messages/${flagId}/approve`),
  banUser: (userId, reason) => api.post(`/admin/users/${userId}/ban`, { reason }),
}

export const analyticsApi = {
  getMessageStats: (days) => api.get('/analytics/messages', { params: { days } }),
  getUserStats: (days) => api.get('/analytics/users', { params: { days } }),
  getTopUsers: () => api.get('/analytics/top-users'),
}

export const mediaApi = {
  getAll: () => api.get('/media'),
}
