import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStrategies, useDeleteStrategy } from '../hooks/useStrategies'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import { Plus, Edit, Trash2, Play, Settings } from 'lucide-react'

export default function StrategiesPage() {
  const { data: strategies, isLoading, error } = useStrategies()
  const deleteStrategyMutation = useDeleteStrategy()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (strategyId: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta estratégia?')) {
      setDeletingId(strategyId)
      try {
        await deleteStrategyMutation.mutateAsync(strategyId)
      } finally {
        setDeletingId(null)
      }
    }
  }

  const getIndicatorLabel = (indicator: string) => {
    const labels: Record<string, string> = {
      pe_ratio: 'P/L',
      pb_ratio: 'P/VPA',
      dividend_yield: 'Dividend Yield',
      payout_ratio: 'Payout',
      debt_to_ebitda: 'Dívida/EBITDA',
      roe: 'ROE',
      net_margin: 'Margem Líquida',
      sector: 'Setor',
      subsector: 'Subsetor',
      market_cap: 'Valor de Mercado',
      dividend_cagr_5y: 'Crescimento de Dividendos (5 anos)'
    }
    return labels[indicator] || indicator
  }

  const getOperatorLabel = (operator: string) => {
    const labels: Record<string, string> = {
      '>': 'Maior que',
      '<': 'Menor que',
      '=': 'Igual a',
      '>=': 'Maior ou igual a',
      '<=': 'Menor ou igual a',
      'in': 'Está em',
      'not_in': 'Não está em'
    }
    return labels[operator] || operator
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="text-center py-12">
          <div className="text-danger-600 mb-4">
            <Settings className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erro ao carregar estratégias
          </h3>
          <p className="text-gray-600">
            Não foi possível carregar suas estratégias personalizadas
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Minhas Estratégias
        </h1>
        <p className="text-lg text-gray-600">
          Crie e gerencie suas estratégias de investimento personalizadas
        </p>
      </div>

      {/* Actions */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {strategies?.length || 0} estratégia(s) criada(s)
        </div>
        <Link to="/strategies/create">
          <Button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Nova Estratégia
          </Button>
        </Link>
      </div>

      {/* Strategies List */}
      {!strategies || strategies.length === 0 ? (
        <Card className="text-center py-12">
          <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma estratégia criada
          </h3>
          <p className="text-gray-600 mb-6">
            Crie sua primeira estratégia personalizada para encontrar ações que atendam aos seus critérios específicos
          </p>
          <Link to="/strategies/create">
            <Button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Estratégia
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies.map((strategy) => (
            <Card key={strategy.id} className="hover:shadow-lg transition-shadow">
              <div className="card-header">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {strategy.name}
                    </h3>
                    {strategy.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {strategy.description}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Link to={`/strategies/${strategy.id}/edit`}>
                      <Button size="sm" className="btn-secondary">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="btn-danger"
                      onClick={() => handleDelete(strategy.id)}
                      loading={deletingId === strategy.id}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="card-body">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Filtros ({strategy.filters.length})
                    </h4>
                    <div className="space-y-1">
                      {strategy.filters.slice(0, 3).map((filter, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          {getIndicatorLabel(filter.indicator)} {getOperatorLabel(filter.operator)}{' '}
                          {filter.value_numeric !== undefined 
                            ? filter.value_numeric 
                            : filter.value_string}
                        </div>
                      ))}
                      {strategy.filters.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{strategy.filters.length - 3} mais...
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        strategy.is_notification_enabled ? 'bg-success-500' : 'bg-gray-300'
                      }`} />
                      <span className="text-xs text-gray-600">
                        {strategy.is_notification_enabled ? 'Notificações ativas' : 'Notificações inativas'}
                      </span>
                    </div>
                    <Link to={`/radar?strategy=${strategy.id}`}>
                      <Button size="sm" className="btn-primary">
                        <Play className="h-3 w-3 mr-1" />
                        Usar
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
