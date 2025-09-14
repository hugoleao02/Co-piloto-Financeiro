import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import DNAFinanceiroPage from './pages/DNAFinanceiroPage'
import RadarPage from './pages/RadarPage'
import PortfolioPage from './pages/PortfolioPage'
import StockAnalysisPage from './pages/StockAnalysisPage'
import StrategiesPage from './pages/StrategiesPage'
import StrategyCreatePage from './pages/StrategyCreatePage'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dna-financeiro" element={<DNAFinanceiroPage />} />
        <Route path="/radar" element={<RadarPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/strategies" element={<StrategiesPage />} />
        <Route path="/strategies/create" element={<StrategyCreatePage />} />
        <Route path="/strategies/:id/edit" element={<StrategyCreatePage />} />
        <Route path="/stock/:ticker" element={<StockAnalysisPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
