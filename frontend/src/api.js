import axios from 'axios'

const API_BASE = 'https://smart-expense-splitter-backend-2lne.onrender.com/api'

const api = axios.create({ baseURL: API_BASE })

// Attach token if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('ses_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me')
}

export const groups = {
  list: () => api.get('/groups'),
  create: (data) => api.post('/groups', data),
  addMember: (groupId, data) => api.post(`/groups/${groupId}/members`, data),
  get: (groupId) => api.get(`/groups/${groupId}`)
}

export const expenses = {
  add: (data) => api.post('/expenses', data),
  list: (params) => api.get('/expenses', { params }),
  get: (id) => api.get(`/expenses/${id}`)
}

export default api