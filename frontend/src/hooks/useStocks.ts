import { useQuery } from '@tanstack/react-query'
import { stocksService } from '../services/stocks'
import { RecommendationResponse, StockAnalysis } from '../types'

export function useRecommendations(limit: number = 10) {
  return useQuery({
    queryKey: ['recommendations', limit],
    queryFn: () => stocksService.getRecommendations(limit),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export function useStockAnalysis(ticker: string) {
  return useQuery({
    queryKey: ['stock-analysis', ticker],
    queryFn: () => stocksService.getStockAnalysis(ticker),
    enabled: !!ticker,
  })
}

export function useAllStocks() {
  return useQuery({
    queryKey: ['stocks'],
    queryFn: stocksService.getAllStocks,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

export function useStockByTicker(ticker: string) {
  return useQuery({
    queryKey: ['stock', ticker],
    queryFn: () => stocksService.getStockByTicker(ticker),
    enabled: !!ticker,
  })
}
