import api from './api'
import { 
  PortfolioSummary, 
  Transaction, 
  Dividend, 
  TransactionCreate, 
  SimulationRequest, 
  SimulationResponse 
} from '../types'

export const portfolioService = {
  async getPortfolioSummary(): Promise<PortfolioSummary> {
    const response = await api.get('/api/portfolio/summary')
    return response.data
  },

  async getTransactions(): Promise<Transaction[]> {
    const response = await api.get('/api/portfolio/transactions')
    return response.data
  },

  async getDividends(): Promise<Dividend[]> {
    const response = await api.get('/api/portfolio/dividends')
    return response.data
  },

  async createTransaction(transactionData: TransactionCreate): Promise<Transaction> {
    const response = await api.post('/api/portfolio/transactions', transactionData)
    return response.data
  },

  async simulateInvestment(simulationData: SimulationRequest): Promise<SimulationResponse> {
    const response = await api.post('/api/portfolio/simulate', simulationData)
    return response.data
  }
}
