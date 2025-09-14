import api from './api'
import { Alert, AlertSummary, AlertStatus } from '../types'

export const alertsService = {
  async getAlerts(status?: AlertStatus, limit: number = 50, offset: number = 0): Promise<Alert[]> {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    params.append('limit', limit.toString())
    params.append('offset', offset.toString())
    
    const response = await api.get(`/api/alerts/alerts?${params}`)
    return response.data
  },

  async getAlertsSummary(): Promise<AlertSummary> {
    const response = await api.get('/api/alerts/alerts/summary')
    return response.data
  },

  async getAlert(alertId: number): Promise<Alert> {
    const response = await api.get(`/api/alerts/alerts/${alertId}`)
    return response.data
  },

  async updateAlert(alertId: number, status: AlertStatus): Promise<Alert> {
    const response = await api.put(`/api/alerts/alerts/${alertId}`, { status })
    return response.data
  },

  async deleteAlert(alertId: number): Promise<void> {
    await api.delete(`/api/alerts/alerts/${alertId}`)
  },

  async markAllAsRead(): Promise<void> {
    await api.post('/api/alerts/alerts/mark-all-read')
  },

  async getUnreadCount(): Promise<{ unread_count: number }> {
    const response = await api.get('/api/alerts/alerts/unread-count')
    return response.data
  },

  async generateAlerts(): Promise<{ message: string; alerts_created: number; alerts: Alert[] }> {
    const response = await api.post('/api/alerts/alerts/generate')
    return response.data
  }
}
