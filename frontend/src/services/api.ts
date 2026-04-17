import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'https://3001-ixt97axeriathjorjukza-00138937.us2.manus.computer'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authApi = {
  register: (email: string, password: string, name: string) =>
    api.post('/api/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  getMe: () => api.get('/api/auth/me'),
}

// WhatsApp endpoints
export const whatsappApi = {
  getContacts: () => api.get('/api/whatsapp/contacts'),
  sendMessage: (phoneNumber: string, message: string) =>
    api.post('/api/whatsapp/send', { phoneNumber, message }),
  pauseContact: (contactId: string) =>
    api.post(`/api/whatsapp/contacts/${contactId}/pause`),
  resumeContact: (contactId: string) =>
    api.post(`/api/whatsapp/contacts/${contactId}/resume`),
  unsubscribeContact: (contactId: string) =>
    api.post(`/api/whatsapp/contacts/${contactId}/unsubscribe`),
}

export const apiClient = api
export default api
