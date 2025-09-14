import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { portfolioService } from '../services/portfolio'
import { 
  PortfolioSummary, 
  Transaction, 
  Dividend, 
  TransactionCreate, 
  SimulationRequest 
} from '../types'

export function usePortfolioSummary() {
  return useQuery({
    queryKey: ['portfolio-summary'],
    queryFn: portfolioService.getPortfolioSummary,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: portfolioService.getTransactions,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export function useDividends() {
  return useQuery({
    queryKey: ['dividends'],
    queryFn: portfolioService.getDividends,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: portfolioService.createTransaction,
    onSuccess: () => {
      // Invalidar queries relacionadas ao portfólio
      queryClient.invalidateQueries({ queryKey: ['portfolio-summary'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useSimulateInvestment() {
  return useMutation({
    mutationFn: portfolioService.simulateInvestment,
  })
}
