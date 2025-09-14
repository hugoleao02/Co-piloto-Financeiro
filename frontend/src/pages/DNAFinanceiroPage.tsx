import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import { Brain, CheckCircle, ArrowRight } from 'lucide-react'

export default function DNAFinanceiroPage() {
  const { user, calculateDNAFinanceiro } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [redirectCountdown, setRedirectCountdown] = useState(0)
  const [formData, setFormData] = useState({
    investment_experience: 1,
    risk_tolerance: 5,
    investment_goal: '',
    investment_horizon: 5,
    monthly_contribution: 1000,
    dividend_preference: 5,
    value_preference: 5,
    quality_preference: 5,
    market_volatility_tolerance: 5,
    long_term_commitment: 5
  })

  const questions = [
    {
      id: 'investment_experience',
      question: 'Qual sua experiência com investimentos?',
      options: [
        { value: 1, label: 'Nenhuma experiência' },
        { value: 2, label: 'Pouca experiência (menos de 1 ano)' },
        { value: 3, label: 'Experiência moderada (1-3 anos)' },
        { value: 4, label: 'Boa experiência (3-5 anos)' },
        { value: 5, label: 'Muita experiência (mais de 5 anos)' }
      ]
    },
    {
      id: 'risk_tolerance',
      question: 'Qual sua tolerância ao risco?',
      options: [
        { value: 1, label: 'Muito conservador' },
        { value: 2, label: 'Conservador' },
        { value: 3, label: 'Moderado' },
        { value: 4, label: 'Agressivo' },
        { value: 5, label: 'Muito agressivo' }
      ]
    },
    {
      id: 'investment_goal',
      question: 'Qual seu principal objetivo de investimento?',
      options: [
        { value: 'renda_passiva', label: 'Gerar renda passiva através de dividendos' },
        { value: 'crescimento', label: 'Crescimento do capital a longo prazo' },
        { value: 'aposentadoria', label: 'Preparar para a aposentadoria' },
        { value: 'reserva_emergencia', label: 'Construir reserva de emergência' }
      ]
    },
    {
      id: 'investment_horizon',
      question: 'Qual seu horizonte de investimento?',
      options: [
        { value: 1, label: 'Menos de 1 ano' },
        { value: 3, label: '1-3 anos' },
        { value: 5, label: '3-5 anos' },
        { value: 10, label: '5-10 anos' },
        { value: 20, label: 'Mais de 10 anos' }
      ]
    },
    {
      id: 'monthly_contribution',
      question: 'Quanto você pode investir por mês?',
      options: [
        { value: 100, label: 'Até R$ 100' },
        { value: 500, label: 'R$ 100 - R$ 500' },
        { value: 1000, label: 'R$ 500 - R$ 1.000' },
        { value: 2000, label: 'R$ 1.000 - R$ 2.000' },
        { value: 5000, label: 'Mais de R$ 2.000' }
      ]
    },
    {
      id: 'dividend_preference',
      question: 'O quanto você valoriza dividendos?',
      options: [
        { value: 1, label: 'Não me importo com dividendos' },
        { value: 3, label: 'Dividendos são interessantes' },
        { value: 5, label: 'Dividendos são importantes' },
        { value: 8, label: 'Dividendos são muito importantes' },
        { value: 10, label: 'Dividendos são essenciais' }
      ]
    },
    {
      id: 'value_preference',
      question: 'O quanto você valoriza comprar ações "baratas"?',
      options: [
        { value: 1, label: 'Não me importo com preço' },
        { value: 3, label: 'Preço é interessante' },
        { value: 5, label: 'Preço é importante' },
        { value: 8, label: 'Preço é muito importante' },
        { value: 10, label: 'Preço é essencial' }
      ]
    },
    {
      id: 'quality_preference',
      question: 'O quanto você valoriza qualidade das empresas?',
      options: [
        { value: 1, label: 'Qualidade não importa' },
        { value: 3, label: 'Qualidade é interessante' },
        { value: 5, label: 'Qualidade é importante' },
        { value: 8, label: 'Qualidade é muito importante' },
        { value: 10, label: 'Qualidade é essencial' }
      ]
    },
    {
      id: 'market_volatility_tolerance',
      question: 'Como você reage à volatilidade do mercado?',
      options: [
        { value: 1, label: 'Fico muito nervoso' },
        { value: 3, label: 'Fico um pouco nervoso' },
        { value: 5, label: 'Fico neutro' },
        { value: 8, label: 'Vejo como oportunidade' },
        { value: 10, label: 'Fico animado' }
      ]
    },
    {
      id: 'long_term_commitment',
      question: 'O quanto você se compromete com investimentos de longo prazo?',
      options: [
        { value: 1, label: 'Prefiro investimentos de curto prazo' },
        { value: 3, label: 'Alguns investimentos de longo prazo' },
        { value: 5, label: 'Equilibro entre curto e longo prazo' },
        { value: 8, label: 'Maioria dos investimentos de longo prazo' },
        { value: 10, label: 'Apenas investimentos de longo prazo' }
      ]
    }
  ]

  const handleAnswer = (questionId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const result = await calculateDNAFinanceiro(formData)
      setResult(result)
      
      // Iniciar contador de redirecionamento
      setRedirectCountdown(3)
      const countdownInterval = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            window.location.href = '/radar'
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error('Erro ao calcular DNA Financeiro:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getArchetypeInfo = (archetype: string) => {
    switch (archetype) {
      case 'construtor_renda':
        return {
          title: 'Construtor de Renda',
          description: 'Você foca em construir um fluxo de renda passiva através de dividendos consistentes e crescentes.',
          philosophy: 'Priorize empresas com histórico de dividendos crescentes, payout sustentável e setores perenes.',
          icon: '💰',
          color: 'success'
        }
      case 'cacador_valor':
        return {
          title: 'Caçador de Valor',
          description: 'Você busca encontrar empresas com grande margem de segurança, comprando ativos por menos do que valem.',
          philosophy: 'Busque empresas com P/L e P/VPA baixos, margem de segurança significativa e fundamentos sólidos.',
          icon: '🔍',
          color: 'primary'
        }
      case 'socio_paciente':
        return {
          title: 'Sócio Paciente',
          description: 'Seu perfil é equilibrado, combinando valor, renda e qualidade para investimentos de longo prazo.',
          philosophy: 'Invista em empresas de alta qualidade com boa governança, setores defensivos e crescimento sustentável.',
          icon: '🌱',
          color: 'warning'
        }
      default:
        return {
          title: 'Perfil não definido',
          description: 'Complete o questionário para descobrir seu perfil.',
          philosophy: '',
          icon: '❓',
          color: 'gray'
        }
    }
  }

  if (result) {
    const archetypeInfo = getArchetypeInfo(result.archetype)
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="text-center">
          <div className="py-8">
            <div className="text-6xl mb-4">{archetypeInfo.icon}</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {archetypeInfo.title}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {result.description}
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Sua Filosofia de Investimento
              </h3>
              <p className="text-gray-700">
                {result.investment_philosophy}
              </p>
            </div>
            {redirectCountdown > 0 && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-700">
                  Redirecionando para o Radar de Investimentos em {redirectCountdown} segundos...
                </p>
              </div>
            )}
            
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => window.location.href = '/'}
                className="btn-primary"
              >
                Ir para Dashboard
              </Button>
              <Button
                onClick={() => window.location.href = '/radar'}
                className="btn-secondary"
              >
                Ver Recomendações
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentStep]
  const progress = ((currentStep + 1) / questions.length) * 100

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <div className="card-header">
          <div className="flex items-center mb-4">
            <Brain className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                DNA Financeiro
              </h1>
              <p className="text-gray-600">
                Descubra seu perfil de investidor
              </p>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Pergunta {currentStep + 1} de {questions.length}
          </p>
        </div>

        <div className="card-body">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(currentQuestion.id, option.value)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  formData[currentQuestion.id as keyof typeof formData] === option.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    formData[currentQuestion.id as keyof typeof formData] === option.value
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300'
                  }`}>
                    {formData[currentQuestion.id as keyof typeof formData] === option.value && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-gray-900">{option.label}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <Button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              variant="secondary"
              disabled={currentStep === 0}
            >
              Anterior
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={formData[currentQuestion.id as keyof typeof formData] === undefined}
              loading={isLoading && currentStep === questions.length - 1}
            >
              {currentStep === questions.length - 1 ? 'Finalizar' : 'Próxima'}
              {currentStep < questions.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
