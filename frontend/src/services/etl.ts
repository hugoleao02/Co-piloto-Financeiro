import api from './api'

export const etlService = {
  async collectStockData(ticker: string): Promise<void> {
    const response = await api.post(`/api/etl/collect-stock-data?ticker=${ticker}`)
    return response.data
  },

  async collectAllStocks(): Promise<void> {
    const response = await api.post('/api/etl/collect-all-stocks')
    return response.data
  },

  async getETLStatus(): Promise<{
    status: string
    last_update: string
    stocks_processed: number
    errors: string[]
  }> {
    const response = await api.get('/api/etl/etl-status')
    return response.data
  }
}
