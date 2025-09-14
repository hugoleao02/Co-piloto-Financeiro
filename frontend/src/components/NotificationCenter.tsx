import { useState } from 'react'
import { useAlerts, useAlertsSummary, useUpdateAlert, useMarkAllAsRead } from '../hooks/useAlerts'
import { AlertStatus, AlertType } from '../types'
import Card from './Card'
import Button from './Button'
import LoadingSpinner from './LoadingSpinner'
import { Bell, X, Check, Eye, Trash2, Target, Star, DollarSign, TrendingUp } from 'lucide-react'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [filter, setFilter] = useState<AlertStatus | undefined>(undefined)
  
  const { data: alerts, isLoading } = useAlerts(filter, 20, 0)
  const { data: summary } = useAlertsSummary()
  const updateAlert = useUpdateAlert()
  const markAllAsRead = useMarkAllAsRead()

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case AlertType.STRATEGY_MATCH:
        return <Target className="h-4 w-4 text-blue-600" />
      case AlertType.SCORE_ALERT:
        return <Star className="h-4 w-4 text-yellow-600" />
      case AlertType.DIVIDEND_ALERT:
        return <DollarSign className="h-4 w-4 text-green-600" />
      case AlertType.PRICE_ALERT:
        return <TrendingUp className="h-4 w-4 text-red-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getAlertColor = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.PENDING:
        return 'border-l-blue-500 bg-blue-50'
      case AlertStatus.SENT:
        return 'border-l-yellow-500 bg-yellow-50'
      case AlertStatus.READ:
        return 'border-l-gray-300 bg-gray-50'
      case AlertStatus.DISMISSED:
        return 'border-l-red-300 bg-red-50'
      default:
        return 'border-l-gray-300 bg-white'
    }
  }

  const handleMarkAsRead = (alertId: number) => {
    updateAlert.mutate({ alertId, status: AlertStatus.READ })
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora mesmo'
    if (diffInHours < 24) return `${diffInHours}h atrás`
    if (diffInHours < 48) return 'Ontem'
    return date.toLocaleDateString('pt-BR')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Notificações
                {summary && summary.unread_alerts > 0 && (
                  <span className="ml-2 rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                    {summary.unread_alerts}
                  </span>
                )}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Filters */}
          <div className="border-b border-gray-200 px-6 py-3">
            <div className="flex space-x-2">
              <Button
                variant={filter === undefined ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter(undefined)}
              >
                Todas
              </Button>
              <Button
                variant={filter === AlertStatus.PENDING ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter(AlertStatus.PENDING)}
              >
                Pendentes
              </Button>
              <Button
                variant={filter === AlertStatus.READ ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter(AlertStatus.READ)}
              >
                Lidas
              </Button>
            </div>
            
            {summary && summary.unread_alerts > 0 && (
              <div className="mt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsRead.isPending}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Marcar todas como lidas
                </Button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : alerts && alerts.length > 0 ? (
              <div className="space-y-2 p-4">
                {alerts.map((alert) => (
                  <Card
                    key={alert.id}
                    className={`border-l-4 ${getAlertColor(alert.status)} ${
                      alert.status === AlertStatus.PENDING ? 'shadow-sm' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getAlertIcon(alert.alert_type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {alert.title}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatDate(alert.created_at)}
                          </span>
                        </div>
                        
                        <p className="mt-1 text-sm text-gray-600">
                          {alert.message}
                        </p>
                        
                        {alert.stock_ticker && (
                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                            <span className="font-medium">{alert.stock_ticker}</span>
                            {alert.current_price && (
                              <span>Preço: {alert.current_price}</span>
                            )}
                            {alert.score && (
                              <span>Score: {alert.score}</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-shrink-0">
                        {alert.status === AlertStatus.PENDING && (
                          <button
                            onClick={() => handleMarkAsRead(alert.id)}
                            className="rounded-md p-1 text-gray-400 hover:text-gray-600"
                            title="Marcar como lida"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma notificação
                </h3>
                <p className="text-gray-600">
                  {filter ? 'Nenhuma notificação encontrada com este filtro' : 'Você está em dia!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
