import api from './api'
import { Stock, StockAnalysis, RecommendationResponse } from '../types'

export const stocksService = {
  async getRecommendations(limit: number = 10): Promise<RecommendationResponse> {
    const response = await api.post('/api/recommendations/generate', {
      limit
    })
    return response.data
  },

  async getStockAnalysis(ticker: string): Promise<StockAnalysis> {
    const response = await api.get(`/api/recommendations/stock/${ticker}/analysis`)
    return response.data
  },

  // Nota: Endpoints /api/stocks não existem na API atual
  // As ações são obtidas através das recomendações
}
