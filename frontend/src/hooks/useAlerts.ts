import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { alertsService } from '../services/alerts'
import { AlertStatus } from '../types'

export function useAlerts(status?: AlertStatus, limit: number = 50, offset: number = 0) {
  return useQuery({
    queryKey: ['alerts', status, limit, offset],
    queryFn: () => alertsService.getAlerts(status, limit, offset),
  })
}

export function useAlertsSummary() {
  return useQuery({
    queryKey: ['alerts-summary'],
    queryFn: alertsService.getAlertsSummary,
  })
}

export function useAlert(alertId: number) {
  return useQuery({
    queryKey: ['alert', alertId],
    queryFn: () => alertsService.getAlert(alertId),
    enabled: !!alertId,
  })
}

export function useUpdateAlert() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ alertId, status }: { alertId: number; status: AlertStatus }) =>
      alertsService.updateAlert(alertId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alerts-summary'] })
    },
  })
}

export function useDeleteAlert() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: alertsService.deleteAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alerts-summary'] })
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: alertsService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alerts-summary'] })
    },
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['alerts-unread-count'],
    queryFn: alertsService.getUnreadCount,
    refetchInterval: 30000, // Refetch a cada 30 segundos
  })
}

export function useGenerateAlerts() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: alertsService.generateAlerts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alerts-summary'] })
    },
  })
}
