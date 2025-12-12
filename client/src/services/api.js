import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Events API
export const eventsApi = {
  getAll: async (params = {}) => {
    const response = await api.get('/events', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/events/${id}`)
    return response.data
  },

  create: async (eventData) => {
    const response = await api.post('/events', eventData)
    return response.data
  },

  update: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/events/${id}`)
    return response.data
  },
}

// Bookings API
export const bookingsApi = {
  getAll: async () => {
    const response = await api.get('/bookings')
    return response.data
  },

  getByCode: async (code) => {
    const response = await api.get(`/bookings/code/${code}`)
    return response.data
  },

  getByEvent: async (eventId) => {
    const response = await api.get(`/bookings/event/${eventId}`)
    return response.data
  },

  create: async (bookingData) => {
    const response = await api.post('/bookings', bookingData)
    return response.data
  },

  cancel: async (id) => {
    const response = await api.put(`/bookings/${id}/cancel`)
    return response.data
  },
}

export default api

