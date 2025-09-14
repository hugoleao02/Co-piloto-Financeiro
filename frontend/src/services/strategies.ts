import api from './api'
import { 
  UserStrategy, 
  StrategyCreate, 
  StrategyRecommendationResponse,
  StrategyFilterCreate 
} from '../types'

export const strategiesService = {
  async getStrategies(): Promise<UserStrategy[]> {
    const response = await api.get('/api/strategies/strategies')
    return response.data
  },

  async getStrategy(strategyId: number): Promise<UserStrategy> {
    const response = await api.get(`/api/strategies/strategies/${strategyId}`)
    return response.data
  },

  async createStrategy(strategyData: StrategyCreate): Promise<UserStrategy> {
    const response = await api.post('/api/strategies/strategies', strategyData)
    return response.data
  },

  async updateStrategy(strategyId: number, strategyData: StrategyCreate): Promise<UserStrategy> {
    const response = await api.put(`/api/strategies/strategies/${strategyId}`, strategyData)
    return response.data
  },

  async deleteStrategy(strategyId: number): Promise<void> {
    await api.delete(`/api/strategies/strategies/${strategyId}`)
  },

  async getStrategyRecommendations(strategyId: number, limit: number = 10): Promise<StrategyRecommendationResponse> {
    const response = await api.post(`/api/strategies/strategies/${strategyId}/recommendations`, {
      strategy_id: strategyId,
      limit
    })
    return response.data
  }
}
