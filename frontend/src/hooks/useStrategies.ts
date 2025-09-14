import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { strategiesService } from '../services/strategies'
import { StrategyCreate, StrategyRecommendationResponse } from '../types'

export function useStrategies() {
  return useQuery({
    queryKey: ['strategies'],
    queryFn: strategiesService.getStrategies,
  })
}

export function useStrategy(strategyId: number) {
  return useQuery({
    queryKey: ['strategy', strategyId],
    queryFn: () => strategiesService.getStrategy(strategyId),
    enabled: !!strategyId,
  })
}

export function useCreateStrategy() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: strategiesService.createStrategy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] })
    },
  })
}

export function useUpdateStrategy() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ strategyId, strategyData }: { strategyId: number; strategyData: StrategyCreate }) =>
      strategiesService.updateStrategy(strategyId, strategyData),
    onSuccess: (_, { strategyId }) => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] })
      queryClient.invalidateQueries({ queryKey: ['strategy', strategyId] })
    },
  })
}

export function useDeleteStrategy() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: strategiesService.deleteStrategy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] })
    },
  })
}

export function useStrategyRecommendations(strategyId: number, limit: number = 10) {
  return useQuery({
    queryKey: ['strategy-recommendations', strategyId, limit],
    queryFn: () => strategiesService.getStrategyRecommendations(strategyId, limit),
    enabled: !!strategyId,
  })
}
