import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRecommendations } from '../hooks/useStocks'
import { useStrategies, useStrategyRecommendations } from '../hooks/useStrategies'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import { TrendingUp, TrendingDown, DollarSign, Target, Search, Filter, Bell } from 'lucide-react'

export default function RadarPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStrategyId, setSelectedStrategyId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'general' | 'strategy'>('general')
  
  const { data: recommendations, isLoading, error } = useRecommendations(10)
  const { data: strategies, isLoading: strategiesLoading } = useStrategies()
  const { data: strategyRecommendations, isLoading: strategyLoading } = useStrategyRecommendations(
    selectedStrategyId || 0, 
    10
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-success-600 bg-success-100'
    if (score >= 6) return 'text-warning-600 bg-warning-100'
    return 'text-danger-600 bg-danger-100'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excelente'
    if (score >= 6) return 'Bom'
    if (score >= 4) return 'Regular'
    return 'Ruim'
  }

  // Determinar qual fonte de dados usar
  const currentRecommendations = viewMode === 'strategy' && strategyRecommendations 
    ? strategyRecommendations.recommendations 
    : recommendations?.recommendations || []

  const filteredRecommendations = currentRecommendations.filter(rec =>
    rec.stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleStrategyChange = (strategyId: number | null) => {
    setSelectedStrategyId(strategyId)
    setViewMode(strategyId ? 'strategy' : 'general')
  }

  if (isLoading || (viewMode === 'strategy' && strategyLoading)) {
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
            <Target className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erro ao carregar recomendações
          </h3>
          <p className="text-gray-600 mb-4">
            Verifique sua conexão e tente novamente
          </p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Radar de Investimentos
        </h1>
        <p className="text-gray-600">
          Encontre oportunidades alinhadas ao seu perfil de investidor
        </p>
      </div>

      {/* Controles de filtro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Barra de pesquisa */}
        <Card>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por ticker ou nome da empresa..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Dropdown de estratégias */}
        <Card>
          <div className="flex items-center space-x-3">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              className="input flex-1"
              value={selectedStrategyId || ''}
              onChange={(e) => handleStrategyChange(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Recomendações Gerais</option>
              {strategies?.map((strategy) => (
                <option key={strategy.id} value={strategy.id}>
                  {strategy.name}
                </option>
              ))}
            </select>
          </div>
        </Card>
      </div>

      {/* Informações da estratégia selecionada */}
      {viewMode === 'strategy' && strategyRecommendations && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">
                Estratégia: {strategyRecommendations.strategy_name}
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                {strategyRecommendations.strategy_description}
              </p>
              <p className="text-xs text-blue-600 mt-2">
                {strategyRecommendations.total_found} ações encontradas
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de recomendações */}
      {filteredRecommendations.length > 0 ? (
        <div className="space-y-4">
          {filteredRecommendations.map((rec) => (
            <Card key={rec.stock.ticker} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 mr-3">
                      {rec.stock.ticker}
                    </h3>
                    <span className={`badge ${getScoreColor(rec.stock.final_score || 0)}`}>
                      {getScoreLabel(rec.stock.final_score || 0)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{rec.stock.name}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Setor</p>
                      <p className="font-medium">{rec.stock.sector || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Preço</p>
                      <p className="font-medium">
                        {rec.stock.current_price ? formatCurrency(rec.stock.current_price) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">P/L</p>
                      <p className="font-medium">
                        {rec.stock.pe_ratio ? rec.stock.pe_ratio.toFixed(1) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Div. Yield</p>
                      <p className="font-medium">
                        {rec.stock.dividend_yield ? formatPercent(rec.stock.dividend_yield) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="ml-6 text-right">
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    {(rec.stock.final_score || 0).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">/ 10</div>
                  
                  <div className="mt-4">
                    <Link
                      to={`/stock/${rec.stock.ticker}`}
                      className="btn btn-primary btn-sm"
                    >
                      Analisar
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Checklist dos Mestres */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Checklist dos Mestres
                </h4>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-gray-500 mb-1">Graham</p>
                    <div className="flex space-x-1">
                      <span className={rec.checklist.graham_criteria.pe_ratio_ok ? 'text-success-600' : 'text-gray-400'}>
                        ✓
                      </span>
                      <span className={rec.checklist.graham_criteria.pb_ratio_ok ? 'text-success-600' : 'text-gray-400'}>
                        ✓
                      </span>
                      <span className={rec.checklist.graham_criteria.debt_low ? 'text-success-600' : 'text-gray-400'}>
                        ✓
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Bazin</p>
                    <div className="flex space-x-1">
                      <span className={rec.checklist.bazin_criteria.dividend_yield_ok ? 'text-success-600' : 'text-gray-400'}>
                        ✓
                      </span>
                      <span className={rec.checklist.bazin_criteria.payout_sustainable ? 'text-success-600' : 'text-gray-400'}>
                        ✓
                      </span>
                      <span className={rec.checklist.bazin_criteria.dividend_growth ? 'text-success-600' : 'text-gray-400'}>
                        ✓
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Barsi</p>
                    <div className="flex space-x-1">
                      <span className={rec.checklist.barsi_criteria.sector_best ? 'text-success-600' : 'text-gray-400'}>
                        ✓
                      </span>
                      <span className={rec.checklist.barsi_criteria.consistent_profits ? 'text-success-600' : 'text-gray-400'}>
                        ✓
                      </span>
                      <span className={rec.checklist.barsi_criteria.quality_company ? 'text-success-600' : 'text-gray-400'}>
                        ✓
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Target className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma recomendação encontrada
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Tente ajustar sua pesquisa' : 'Complete seu perfil para ver recomendações personalizadas'}
          </p>
        </Card>
      )}
    </div>
  )
}
