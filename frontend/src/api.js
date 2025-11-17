import axios from 'axios'
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const api = axios.create({ baseURL: API_BASE, timeout: 15000 })

// Attach token if present
// ...existing code...
api.interceptors.request.use(config => {
  try {
    const token = localStorage.getItem('ses_token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (e) {
    // ignore localStorage issues in some environments
  }
  return config
}, err => Promise.reject(err))

api.interceptors.response.use(
  res => res,
  err => {
    if (err.code === 'ECONNABORTED') {
      return api.request(err.config)
    }
    return Promise.reject(err)
  }
)


// keep returning full response (so existing callers using r.data continue to work)
const extract = (res) => res

export const auth = {
  register: (data) => api.post('/auth/register', data).then(extract),
  login: (data) => api.post('/auth/login', data).then(extract),
  me: () => api.get('/auth/me').then(extract)
}

export const groups = {
  list: () => api.get('/groups').then(extract),
  create: (data) => api.post('/groups', data).then(extract),
  addMember: (groupId, data) => api.post(`/groups/${groupId}/members`, data).then(extract),
  get: (groupId) => api.get(`/groups/${groupId}`).then(extract)
}

export const expenses = {
  add: (data) => api.post('/expenses', data).then(extract),
  list: (params) => api.get('/expenses', { params }).then(extract),
  get: (id) => api.get(`/expenses/${id}`).then(extract)
}

export default api
