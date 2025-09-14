// Tipos de usuário
export interface User {
  id: number
  email: string
  full_name?: string
  investor_archetype?: InvestorArchetype
  risk_tolerance?: number
  investment_goal?: string
  investment_horizon?: number
  monthly_contribution?: number
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at?: string
}

export enum InvestorArchetype {
  CONSTRUTOR_RENDA = 'construtor_renda',
  CACADOR_VALOR = 'cacador_valor',
  SOCIO_PACIENTE = 'socio_paciente'
}

// Tipos de ações
export interface Stock {
  id: number
  ticker: string
  name: string
  sector?: string
  subsector?: string
  current_price?: number
  market_cap?: number
  pe_ratio?: number
  pb_ratio?: number
  dividend_yield?: number
  payout_ratio?: number
  debt_to_ebitda?: number
  roe?: number
  net_margin?: number
  dividend_cagr_5y?: number
  bazin_price?: number
  graham_margin?: number
  value_score?: number
  income_score?: number
  quality_score?: number
  final_score?: number
  is_qualified: boolean
  last_updated: string
  data_source?: string
  data_quality_score?: number
}

// Tipos de análise
export interface StockAnalysis {
  stock: Stock
  checklist: MastersChecklist
  explanation: FinanceTranslator
  recommendation: string
  confidence: number
}

export interface MastersChecklist {
  graham_criteria: {
    pe_ratio_ok: boolean
    pb_ratio_ok: boolean
    debt_low: boolean
    roe_good: boolean
  }
  bazin_criteria: {
    dividend_yield_ok: boolean
    payout_sustainable: boolean
    dividend_growth: boolean
  }
  barsi_criteria: {
    sector_best: boolean
    consistent_profits: boolean
    quality_company: boolean
  }
}

export interface FinanceTranslator {
  [key: string]: {
    value: number
    explanation: string
    interpretation: string
  }
}

// Tipos de portfólio
export interface PortfolioPosition {
  stock_ticker: string
  stock_name: string
  quantity: number
  average_price: number
  current_price: number
  total_invested: number
  current_value: number
  unrealized_pnl: number
  unrealized_pnl_percent: number
  monthly_dividend_income?: number
  total_dividends_received: number
}

export interface PortfolioSummary {
  total_invested: number
  current_value: number
  total_pnl: number
  total_pnl_percent: number
  monthly_dividend_income: number
  total_dividends_received: number
  positions: PortfolioPosition[]
  sector_allocation: Record<string, number>
  performance_metrics: Record<string, any>
}

export interface Transaction {
  id: number
  stock_ticker: string
  transaction_type: 'buy' | 'sell'
  quantity: number
  price: number
  total_value: number
  transaction_date: string
  notes?: string
  created_at: string
}

export interface Dividend {
  id: number
  stock_ticker: string
  stock_name: string
  amount_per_share: number
  total_amount: number
  payment_date: string
  ex_date?: string
}

// Tipos de DNA Financeiro
export interface DNAFinanceiroRequest {
  investment_experience: number
  risk_tolerance: number
  investment_goal: string
  investment_horizon: number
  monthly_contribution: number
  dividend_preference: number
  value_preference: number
  quality_preference: number
  market_volatility_tolerance: number
  long_term_commitment: number
}

export interface DNAFinanceiroResponse {
  archetype: InvestorArchetype
  description: string
  investment_philosophy: string
  recommended_weights: Record<string, number>
}

// Tipos de simulação
export interface SimulationRequest {
  stock_ticker: string
  investment_amount: number
}

export interface SimulationResponse {
  stock: {
    ticker: string
    name: string
    current_price: number
    dividend_yield: number
  }
  investment_amount: number
  shares_to_buy: number
  projected_monthly_dividend: number
  projected_annual_dividend: number
  sector_impact: Record<string, number>
  portfolio_impact: {
    new_total_value: number
    new_monthly_dividend_income: number
  }
}

// Tipos de API
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

// Tipos de estratégias
export interface StrategyFilter {
  id?: number
  indicator: FilterIndicator
  operator: FilterOperator
  value_numeric?: number
  value_string?: string
}

export interface UserStrategy {
  id: number
  name: string
  description?: string
  user_id: number
  is_active: boolean
  is_notification_enabled: boolean
  created_at: string
  updated_at?: string
  filters: StrategyFilter[]
}

export interface StrategyCreate {
  name: string
  description?: string
  is_notification_enabled: boolean
  filters: StrategyFilterCreate[]
}

export interface StrategyFilterCreate {
  indicator: FilterIndicator
  operator: FilterOperator
  value_numeric?: number
  value_string?: string
}

export enum FilterIndicator {
  PE_RATIO = 'pe_ratio',
  PB_RATIO = 'pb_ratio',
  DIVIDEND_YIELD = 'dividend_yield',
  PAYOUT_RATIO = 'payout_ratio',
  DEBT_TO_EBITDA = 'debt_to_ebitda',
  ROE = 'roe',
  NET_MARGIN = 'net_margin',
  SECTOR = 'sector',
  SUBSECTOR = 'subsector',
  MARKET_CAP = 'market_cap',
  DIVIDEND_CAGR_5Y = 'dividend_cagr_5y'
}

export enum FilterOperator {
  GREATER_THAN = '>',
  LESS_THAN = '<',
  EQUALS = '=',
  GREATER_EQUAL = '>=',
  LESS_EQUAL = '<=',
  IN = 'in',
  NOT_IN = 'not_in'
}

export interface StrategyRecommendationResponse {
  recommendations: StockAnalysis[]
  strategy_name: string
  strategy_description?: string
  generated_at: string
  total_found: number
}

// Tipos de alertas
export enum AlertType {
  STRATEGY_MATCH = 'strategy_match',
  PRICE_ALERT = 'price_alert',
  DIVIDEND_ALERT = 'dividend_alert',
  SCORE_ALERT = 'score_alert'
}

export enum AlertStatus {
  PENDING = 'pending',
  SENT = 'sent',
  READ = 'read',
  DISMISSED = 'dismissed'
}

export interface Alert {
  id: number
  user_id: number
  strategy_id?: number
  stock_id?: number
  alert_type: AlertType
  title: string
  message: string
  status: AlertStatus
  stock_ticker?: string
  stock_name?: string
  current_price?: string
  score?: string
  created_at: string
  sent_at?: string
  read_at?: string
}

export interface AlertSummary {
  total_alerts: number
  unread_alerts: number
  pending_alerts: number
  recent_alerts: Alert[]
}

// Tipos de componentes
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export interface CardProps {
  children: React.ReactNode
  className?: string
  header?: React.ReactNode
  footer?: React.ReactNode
}
