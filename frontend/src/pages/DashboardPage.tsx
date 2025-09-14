import { useAuth } from '../hooks/useAuth'
import { usePortfolioSummary } from '../hooks/usePortfolio'
import { useRecommendations } from '../hooks/useStocks'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import { TrendingUp, TrendingDown, DollarSign, PieChart, Brain, Target } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolioSummary()
  const { data: recommendations, isLoading: recommendationsLoading } = useRecommendations(5)

  const getArchetypeDescription = (archetype: string) => {
    switch (archetype) {
      case 'construtor_renda':
        return 'Foco em dividendos consistentes e crescentes'
      case 'cacador_valor':
        return 'Busca por empresas com margem de segurança'
      case 'socio_paciente':
        return 'Equilíbrio entre valor, renda e qualidade'
      default:
        return 'Perfil não definido'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Olá, {user?.full_name || user?.email}!
        </h1>
        <p className="mt-2 text-gray-600">
          Bem-vindo ao seu Co-piloto Financeiro
        </p>
      </div>

      {/* Perfil do usuário */}
      {user?.investor_archetype ? (
        <Card className="mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                {user.investor_archetype.replace('_', ' ').toUpperCase()}
              </h3>
              <p className="text-sm text-gray-600">
                {getArchetypeDescription(user.investor_archetype)}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="mb-6 border-warning-200 bg-warning-50">
          <div className="flex items-center">
            <Target className="h-6 w-6 text-warning-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-warning-800">
                Complete seu perfil de investidor
              </h3>
              <p className="text-sm text-warning-700">
                Faça o teste do DNA Financeiro para receber recomendações personalizadas
              </p>
              <Link
                to="/dna-financeiro"
                className="mt-2 inline-block text-sm font-medium text-warning-600 hover:text-warning-500"
              >
                Fazer teste agora →
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Resumo do portfólio */}
      {portfolioLoading ? (
        <Card className="mb-6">
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        </Card>
      ) : portfolio ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Valor Investido</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(portfolio.total_invested)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {portfolio.total_pnl >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-success-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-danger-600" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Valor Atual</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(portfolio.current_value)}
                </p>
                <p className={`text-sm ${portfolio.total_pnl >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  {formatPercent(portfolio.total_pnl_percent)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PieChart className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Renda Mensal</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(portfolio.monthly_dividend_income)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Dividendos Recebidos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(portfolio.total_dividends_received)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="mb-6">
          <div className="text-center py-8">
            <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum investimento ainda
            </h3>
            <p className="text-gray-600 mb-4">
              Comece explorando oportunidades no Radar de Investimentos
            </p>
            <Link
              to="/radar"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Ver Oportunidades
            </Link>
          </div>
        </Card>
      )}

      {/* Recomendações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Top Recomendações
            </h3>
          </div>
          <div className="card-body">
            {recommendationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : recommendations?.recommendations?.length ? (
              <div className="space-y-4">
                {recommendations.recommendations.slice(0, 3).map((rec) => (
                  <div key={rec.stock.ticker} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{rec.stock.ticker}</p>
                      <p className="text-sm text-gray-600">{rec.stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary-600">
                        {rec.stock.final_score?.toFixed(1)}/10
                      </p>
                      <p className="text-sm text-gray-500">
                        {rec.stock.sector}
                      </p>
                    </div>
                  </div>
                ))}
                <Link
                  to="/radar"
                  className="block text-center text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  Ver todas as recomendações →
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  Complete seu perfil para ver recomendações personalizadas
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Ações Rápidas
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <Link
                to="/dna-financeiro"
                className="flex items-center p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <Brain className="h-5 w-5 text-primary-600 mr-3" />
                <div>
                  <p className="font-medium text-primary-900">DNA Financeiro</p>
                  <p className="text-sm text-primary-700">Defina seu perfil de investidor</p>
                </div>
              </Link>
              
              <Link
                to="/radar"
                className="flex items-center p-3 bg-success-50 rounded-lg hover:bg-success-100 transition-colors"
              >
                <Target className="h-5 w-5 text-success-600 mr-3" />
                <div>
                  <p className="font-medium text-success-900">Radar de Investimentos</p>
                  <p className="text-sm text-success-700">Encontre oportunidades</p>
                </div>
              </Link>
              
              <Link
                to="/portfolio"
                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <PieChart className="h-5 w-5 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Meu Portfólio</p>
                  <p className="text-sm text-gray-700">Gerencie seus investimentos</p>
                </div>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
