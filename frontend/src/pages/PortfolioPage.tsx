import { useState } from 'react'
import { usePortfolioSummary, useTransactions, useCreateTransaction } from '../hooks/usePortfolio'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react'

export default function PortfolioPage() {
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolioSummary()
  const { data: transactions, isLoading: transactionsLoading } = useTransactions()
  const createTransactionMutation = useCreateTransaction()

  const [transactionForm, setTransactionForm] = useState({
    stock_ticker: '',
    transaction_type: 'buy' as 'buy' | 'sell',
    quantity: 0,
    price: 0,
    transaction_date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTransactionMutation.mutateAsync(transactionForm)
      setShowAddTransaction(false)
      setTransactionForm({
        stock_ticker: '',
        transaction_type: 'buy',
        quantity: 0,
        price: 0,
        transaction_date: new Date().toISOString().split('T')[0],
        notes: ''
      })
    } catch (error) {
      console.error('Erro ao criar transação:', error)
    }
  }

  if (portfolioLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Meu Portfólio
          </h1>
          <p className="text-gray-600">
            Gerencie seus investimentos e acompanhe o desempenho
          </p>
        </div>
        <Button
          onClick={() => setShowAddTransaction(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Transação
        </Button>
      </div>

      {/* Resumo do portfólio */}
      {portfolio && (
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
      )}

      {/* Alocação setorial */}
      {portfolio && portfolio.sector_allocation && Object.keys(portfolio.sector_allocation).length > 0 && (
        <Card className="mb-8">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Alocação Setorial
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {Object.entries(portfolio.sector_allocation).map(([sector, percentage]) => (
                <div key={sector} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{sector}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Posições */}
      {portfolio && portfolio.positions.length > 0 ? (
        <Card className="mb-8">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Suas Posições
            </h3>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço Médio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Atual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      P&L
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Renda Mensal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {portfolio.positions.map((position) => (
                    <tr key={position.stock_ticker}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {position.stock_ticker}
                          </div>
                          <div className="text-sm text-gray-500">
                            {position.stock_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {position.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(position.average_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(position.current_value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={position.unrealized_pnl >= 0 ? 'text-success-600' : 'text-danger-600'}>
                          {formatCurrency(position.unrealized_pnl)}
                        </span>
                        <div className="text-xs text-gray-500">
                          {formatPercent(position.unrealized_pnl_percent)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {position.monthly_dividend_income ? formatCurrency(position.monthly_dividend_income) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="mb-8">
          <div className="text-center py-12">
            <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma posição ainda
            </h3>
            <p className="text-gray-600 mb-4">
              Comece adicionando suas primeiras transações
            </p>
            <Button
              onClick={() => setShowAddTransaction(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Transação
            </Button>
          </div>
        </Card>
      )}

      {/* Modal de adicionar transação */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Adicionar Transação
              </h3>
              <form onSubmit={handleTransactionSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="label block">Ticker da Ação</label>
                    <input
                      type="text"
                      className="input w-full"
                      value={transactionForm.stock_ticker}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, stock_ticker: e.target.value.toUpperCase() }))}
                      placeholder="Ex: PETR4"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="label block">Tipo de Transação</label>
                    <select
                      className="input w-full"
                      value={transactionForm.transaction_type}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, transaction_type: e.target.value as 'buy' | 'sell' }))}
                    >
                      <option value="buy">Compra</option>
                      <option value="sell">Venda</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label block">Quantidade</label>
                      <input
                        type="number"
                        className="input w-full"
                        value={transactionForm.quantity}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="label block">Preço</label>
                      <input
                        type="number"
                        step="0.01"
                        className="input w-full"
                        value={transactionForm.price}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="label block">Data</label>
                    <input
                      type="date"
                      className="input w-full"
                      value={transactionForm.transaction_date}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, transaction_date: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="label block">Observações (Opcional)</label>
                    <textarea
                      className="input w-full"
                      rows={3}
                      value={transactionForm.notes}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowAddTransaction(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    loading={createTransactionMutation.isPending}
                  >
                    Adicionar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
