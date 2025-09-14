import api from './api'
import { User, LoginRequest, RegisterRequest, AuthResponse, DNAFinanceiroRequest, DNAFinanceiroResponse } from '../types'

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const formData = new FormData()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)
    
    const response = await api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  },

  async register(userData: RegisterRequest): Promise<User> {
    const response = await api.post('/api/auth/register', userData)
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/api/users/me')
    return response.data
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.put('/api/users/me', userData)
    return response.data
  },

  async getProfileCompletion(): Promise<{
    completion_percentage: number
    completed_fields: string[]
    missing_fields: string[]
    is_complete: boolean
  }> {
    const response = await api.get('/api/users/profile-completion')
    return response.data
  },

  async calculateDNAFinanceiro(dnaData: DNAFinanceiroRequest): Promise<DNAFinanceiroResponse> {
    const response = await api.post('/api/auth/dna-financeiro', dnaData)
    return response.data
  },

  logout(): void {
    localStorage.removeItem('access_token')
    window.location.href = '/login'
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token')
  },

  getToken(): string | null {
    return localStorage.getItem('access_token')
  },

  setToken(token: string): void {
    localStorage.setItem('access_token', token)
  }
}
