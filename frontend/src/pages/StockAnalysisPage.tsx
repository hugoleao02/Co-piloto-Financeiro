import { useParams } from 'react-router-dom'
import { useStockAnalysis } from '../hooks/useStocks'
import { useSimulateInvestment } from '../hooks/usePortfolio'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Calculator } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function StockAnalysisPage() {
  const { ticker } = useParams<{ ticker: string }>()
  const { data: analysis, isLoading, error } = useStockAnalysis(ticker || '')
  const simulateInvestmentMutation = useSimulateInvestment()
  const [simulationAmount, setSimulationAmount] = useState(1000)
  const [simulationResult, setSimulationResult] = useState<any>(null)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const handleSimulate = async () => {
    if (!ticker) return
    
    try {
      const result = await simulateInvestmentMutation.mutateAsync({
        stock_ticker: ticker,
        investment_amount: simulationAmount
      })
      setSimulationResult(result)
    } catch (error) {
      console.error('Erro na simulação:', error)
    }
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

  if (error || !analysis) {
    return (
      <div className="p-6">
        <Card className="text-center py-12">
          <div className="text-danger-600 mb-4">
            <TrendingDown className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erro ao carregar análise
          </h3>
          <p className="text-gray-600 mb-4">
            Não foi possível carregar os dados desta ação
          </p>
          <Link to="/radar" className="btn btn-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Radar
          </Link>
        </Card>
      </div>
    )
  }

  const stock = analysis.stock

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/radar" className="inline-flex items-center text-primary-600 hover:text-primary-500 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Radar
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {stock.ticker}
              </h1>
              <p className="text-lg text-gray-600">{stock.name}</p>
              <p className="text-sm text-gray-500">{stock.sector}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="text-center sm:text-right">
                <div className="text-3xl font-bold text-primary-600">
                  {(stock.final_score || 0).toFixed(1)}/10
                </div>
                <div className="text-sm text-gray-500">Nota Final</div>
              </div>
              
              <Button
                onClick={handleSimulate}
                loading={simulateInvestmentMutation.isPending}
                className="btn-primary"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Simular Investimento
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Informações principais */}
          <div className="xl:col-span-2 space-y-6">
          {/* Dados fundamentais */}
          <Card>
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">
                Dados Fundamentais
              </h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Preço Atual</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stock.current_price ? formatCurrency(stock.current_price) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">P/L</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stock.pe_ratio ? stock.pe_ratio.toFixed(1) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">P/VPA</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stock.pb_ratio ? stock.pb_ratio.toFixed(1) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Div. Yield</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stock.dividend_yield ? formatPercent(stock.dividend_yield) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ROE</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stock.roe ? formatPercent(stock.roe) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Margem Líquida</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stock.net_margin ? formatPercent(stock.net_margin) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dívida/EBITDA</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stock.debt_to_ebitda ? stock.debt_to_ebitda.toFixed(1) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payout</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stock.payout_ratio ? formatPercent(stock.payout_ratio) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Checklist dos Mestres */}
          <Card>
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">
                Checklist dos Mestres
              </h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Benjamin Graham</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className={analysis.checklist.graham_criteria.pe_ratio_ok ? 'text-success-600' : 'text-danger-600'}>
                        {analysis.checklist.graham_criteria.pe_ratio_ok ? '✓' : '✗'}
                      </span>
                      <span className="ml-2 text-sm text-gray-700">P/L &lt; 15</span>
                    </div>
                    <div className="flex items-center">
                      <span className={analysis.checklist.graham_criteria.pb_ratio_ok ? 'text-success-600' : 'text-danger-600'}>
                        {analysis.checklist.graham_criteria.pb_ratio_ok ? '✓' : '✗'}
                      </span>
                      <span className="ml-2 text-sm text-gray-700">P/VPA &lt; 1.5</span>
                    </div>
                    <div className="flex items-center">
                      <span className={analysis.checklist.graham_criteria.debt_low ? 'text-success-600' : 'text-danger-600'}>
                        {analysis.checklist.graham_criteria.debt_low ? '✓' : '✗'}
                      </span>
                      <span className="ml-2 text-sm text-gray-700">Dívida baixa</span>
                    </div>
                    <div className="flex items-center">
                      <span className={analysis.checklist.graham_criteria.roe_good ? 'text-success-600' : 'text-danger-600'}>
                        {analysis.checklist.graham_criteria.roe_good ? '✓' : '✗'}
                      </span>
                      <span className="ml-2 text-sm text-gray-700">ROE &gt; 15%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Décio Bazin</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className={analysis.checklist.bazin_criteria.dividend_yield_ok ? 'text-success-600' : 'text-danger-600'}>
                        {analysis.checklist.bazin_criteria.dividend_yield_ok ? '✓' : '✗'}
                      </span>
                      <span className="ml-2 text-sm text-gray-700">DY &gt; 6%</span>
                    </div>
                    <div className="flex items-center">
                      <span className={analysis.checklist.bazin_criteria.payout_sustainable ? 'text-success-600' : 'text-danger-600'}>
                        {analysis.checklist.bazin_criteria.payout_sustainable ? '✓' : '✗'}
                      </span>
                      <span className="ml-2 text-sm text-gray-700">Payout sustentável</span>
                    </div>
                    <div className="flex items-center">
                      <span className={analysis.checklist.bazin_criteria.dividend_growth ? 'text-success-600' : 'text-danger-600'}>
                        {analysis.checklist.bazin_criteria.dividend_growth ? '✓' : '✗'}
                      </span>
                      <span className="ml-2 text-sm text-gray-700">Crescimento de dividendos</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Luiz Barsi</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className={analysis.checklist.barsi_criteria.sector_best ? 'text-success-600' : 'text-danger-600'}>
                        {analysis.checklist.barsi_criteria.sector_best ? '✓' : '✗'}
                      </span>
                      <span className="ml-2 text-sm text-gray-700">Setor BEST</span>
                    </div>
                    <div className="flex items-center">
                      <span className={analysis.checklist.barsi_criteria.consistent_profits ? 'text-success-600' : 'text-danger-600'}>
                        {analysis.checklist.barsi_criteria.consistent_profits ? '✓' : '✗'}
                      </span>
                      <span className="ml-2 text-sm text-gray-700">Lucros consistentes</span>
                    </div>
                    <div className="flex items-center">
                      <span className={analysis.checklist.barsi_criteria.quality_company ? 'text-success-600' : 'text-danger-600'}>
                        {analysis.checklist.barsi_criteria.quality_company ? '✓' : '✗'}
                      </span>
                      <span className="ml-2 text-sm text-gray-700">Empresa de qualidade</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Tradutor de Financês */}
          <Card>
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">
                Tradutor de Financês
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {Object.entries(analysis.explanation).map(([key, explanation]) => (
                  <div key={key} className="border-l-4 border-primary-200 pl-4">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {key.replace('_', ' ')}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {explanation.explanation}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {explanation.interpretation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Simulador de Impacto */}
          <Card>
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">
                Simulador de Impacto
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div>
                  <label className="label block">Valor a investir</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={simulationAmount}
                    onChange={(e) => setSimulationAmount(parseFloat(e.target.value) || 0)}
                    placeholder="1000"
                  />
                </div>
                
                <Button
                  onClick={handleSimulate}
                  loading={simulateInvestmentMutation.isPending}
                  className="w-full"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Simular Investimento
                </Button>

                {simulationResult && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Resultado da Simulação</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ações a comprar:</span>
                        <span className="font-medium">{simulationResult.shares_to_buy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dividendo mensal:</span>
                        <span className="font-medium text-success-600">
                          {formatCurrency(simulationResult.projected_monthly_dividend)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dividendo anual:</span>
                        <span className="font-medium text-success-600">
                          {formatCurrency(simulationResult.projected_annual_dividend)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Recomendação */}
          <Card>
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">
                Recomendação
              </h3>
            </div>
            <div className="card-body">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {(analysis.confidence * 100).toFixed(0)}%
                </div>
                <p className="text-sm text-gray-500 mb-4">Confiança</p>
                <p className="text-sm text-gray-700">
                  {analysis.recommendation}
                </p>
              </div>
            </div>
          </Card>

          {/* Notas do sistema */}
          <Card>
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">
                Notas do Sistema
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valor (Graham)</span>
                    <span className="font-medium">{stock.value_score?.toFixed(1) || 'N/A'}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(stock.value_score || 0) * 10}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Renda (Bazin)</span>
                    <span className="font-medium">{stock.income_score?.toFixed(1) || 'N/A'}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-success-600 h-2 rounded-full"
                      style={{ width: `${(stock.income_score || 0) * 10}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Qualidade</span>
                    <span className="font-medium">{stock.quality_score?.toFixed(1) || 'N/A'}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-warning-600 h-2 rounded-full"
                      style={{ width: `${(stock.quality_score || 0) * 10}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
