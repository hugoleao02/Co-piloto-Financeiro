import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreateStrategy, useUpdateStrategy, useStrategy } from '../hooks/useStrategies'
import { StrategyCreate, StrategyFilterCreate, FilterIndicator, FilterOperator } from '../types'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'

export default function StrategyCreatePage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  
  const { data: existingStrategy, isLoading: loadingStrategy } = useStrategy(Number(id))
  const createStrategyMutation = useCreateStrategy()
  const updateStrategyMutation = useUpdateStrategy()
  
  const [formData, setFormData] = useState<StrategyCreate>({
    name: '',
    description: '',
    is_notification_enabled: false,
    filters: []
  })

  // Carregar dados existentes se estiver editando
  useState(() => {
    if (isEditing && existingStrategy) {
      setFormData({
        name: existingStrategy.name,
        description: existingStrategy.description || '',
        is_notification_enabled: existingStrategy.is_notification_enabled,
        filters: existingStrategy.filters.map(f => ({
          indicator: f.indicator,
          operator: f.operator,
          value_numeric: f.value_numeric,
          value_string: f.value_string
        }))
      })
    }
  })

  const indicatorOptions = [
    { value: FilterIndicator.PE_RATIO, label: 'P/L (Preço/Lucro)' },
    { value: FilterIndicator.PB_RATIO, label: 'P/VPA (Preço/Valor Patrimonial)' },
    { value: FilterIndicator.DIVIDEND_YIELD, label: 'Dividend Yield' },
    { value: FilterIndicator.PAYOUT_RATIO, label: 'Payout' },
    { value: FilterIndicator.DEBT_TO_EBITDA, label: 'Dívida/EBITDA' },
    { value: FilterIndicator.ROE, label: 'ROE (Retorno sobre Patrimônio)' },
    { value: FilterIndicator.NET_MARGIN, label: 'Margem Líquida' },
    { value: FilterIndicator.SECTOR, label: 'Setor' },
    { value: FilterIndicator.SUBSECTOR, label: 'Subsetor' },
    { value: FilterIndicator.MARKET_CAP, label: 'Valor de Mercado' },
    { value: FilterIndicator.DIVIDEND_CAGR_5Y, label: 'Crescimento de Dividendos (5 anos)' }
  ]

  const operatorOptions = [
    { value: FilterOperator.GREATER_THAN, label: 'Maior que (>)' },
    { value: FilterOperator.LESS_THAN, label: 'Menor que (<)' },
    { value: FilterOperator.EQUALS, label: 'Igual a (=)' },
    { value: FilterOperator.GREATER_EQUAL, label: 'Maior ou igual (>=)' },
    { value: FilterOperator.LESS_EQUAL, label: 'Menor ou igual (<=)' },
    { value: FilterOperator.IN, label: 'Está em' },
    { value: FilterOperator.NOT_IN, label: 'Não está em' }
  ]

  const addFilter = () => {
    setFormData(prev => ({
      ...prev,
      filters: [...prev.filters, {
        indicator: FilterIndicator.PE_RATIO,
        operator: FilterOperator.GREATER_THAN,
        value_numeric: 0
      }]
    }))
  }

  const removeFilter = (index: number) => {
    setFormData(prev => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index)
    }))
  }

  const updateFilter = (index: number, field: keyof StrategyFilterCreate, value: any) => {
    setFormData(prev => ({
      ...prev,
      filters: prev.filters.map((filter, i) => 
        i === index ? { ...filter, [field]: value } : filter
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.filters.length === 0) {
      alert('Adicione pelo menos um filtro à estratégia')
      return
    }

    try {
      if (isEditing) {
        await updateStrategyMutation.mutateAsync({
          strategyId: Number(id),
          strategyData: formData
        })
      } else {
        await createStrategyMutation.mutateAsync(formData)
      }
      navigate('/strategies')
    } catch (error) {
      console.error('Erro ao salvar estratégia:', error)
    }
  }

  if (loadingStrategy) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/strategies')}
          className="inline-flex items-center text-primary-600 hover:text-primary-500 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar às Estratégias
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Editar Estratégia' : 'Nova Estratégia'}
        </h1>
        <p className="text-lg text-gray-600">
          {isEditing ? 'Modifique sua estratégia personalizada' : 'Crie uma estratégia personalizada de investimento'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Básicas */}
          <div className="lg:col-span-1">
            <Card>
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Informações Básicas
                </h3>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <label className="label block">Nome da Estratégia</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Caça a Dividendos"
                    required
                  />
                </div>
                
                <div>
                  <label className="label block">Descrição (opcional)</label>
                  <textarea
                    className="input w-full h-20 resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva sua estratégia..."
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifications"
                    className="mr-2"
                    checked={formData.is_notification_enabled}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      is_notification_enabled: e.target.checked 
                    }))}
                  />
                  <label htmlFor="notifications" className="text-sm text-gray-700">
                    Ativar notificações para esta estratégia
                  </label>
                </div>
              </div>
            </Card>
          </div>

          {/* Filtros */}
          <div className="lg:col-span-2">
            <Card>
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Filtros ({formData.filters.length})
                  </h3>
                  <Button
                    type="button"
                    onClick={addFilter}
                    className="btn-secondary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Filtro
                  </Button>
                </div>
              </div>
              <div className="card-body">
                {formData.filters.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum filtro adicionado</p>
                    <p className="text-sm">Clique em "Adicionar Filtro" para começar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.filters.map((filter, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">
                            Filtro {index + 1}
                          </h4>
                          <Button
                            type="button"
                            onClick={() => removeFilter(index)}
                            className="btn-danger btn-sm"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="label block">Indicador</label>
                            <select
                              className="input w-full"
                              value={filter.indicator}
                              onChange={(e) => updateFilter(index, 'indicator', e.target.value as FilterIndicator)}
                            >
                              {indicatorOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="label block">Operador</label>
                            <select
                              className="input w-full"
                              value={filter.operator}
                              onChange={(e) => updateFilter(index, 'operator', e.target.value as FilterOperator)}
                            >
                              {operatorOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="label block">Valor</label>
                            {filter.indicator === FilterIndicator.SECTOR || 
                             filter.indicator === FilterIndicator.SUBSECTOR ? (
                              <input
                                type="text"
                                className="input w-full"
                                value={filter.value_string || ''}
                                onChange={(e) => updateFilter(index, 'value_string', e.target.value)}
                                placeholder="Ex: Bancos, Energia"
                              />
                            ) : (
                              <input
                                type="number"
                                step="0.01"
                                className="input w-full"
                                value={filter.value_numeric || ''}
                                onChange={(e) => updateFilter(index, 'value_numeric', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end space-x-4">
          <Button
            type="button"
            onClick={() => navigate('/strategies')}
            className="btn-secondary"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="btn-primary"
            loading={createStrategyMutation.isPending || updateStrategyMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Atualizar Estratégia' : 'Criar Estratégia'}
          </Button>
        </div>
      </form>
    </div>
  )
}
