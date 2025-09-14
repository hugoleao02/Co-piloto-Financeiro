import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/auth'
import { User, LoginRequest, RegisterRequest, DNAFinanceiroRequest } from '../types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<void>
  calculateDNAFinanceiro: (dnaData: DNAFinanceiroRequest) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const queryClient = useQueryClient()

  // Verificar se usuário está autenticado ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch (error) {
          authService.logout()
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      authService.setToken(data.access_token)
      // Buscar dados do usuário após login
      try {
        const userData = await authService.getCurrentUser()
        setUser(userData)
        queryClient.setQueryData(['user'], userData)
      } catch (error) {
        // Erro ao buscar dados do usuário
      }
    },
  })

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      // Após registro, fazer login automaticamente
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      queryClient.setQueryData(['user'], updatedUser)
    },
  })

  const dnaFinanceiroMutation = useMutation({
    mutationFn: authService.calculateDNAFinanceiro,
    onSuccess: () => {
      // Atualizar dados do usuário após calcular DNA
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  // Query para buscar dados do usuário
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: authService.getCurrentUser,
    enabled: authService.isAuthenticated() && !user,
  })

  // Atualizar usuário quando dados são carregados
  useEffect(() => {
    if (userData) {
      setUser(userData)
    }
  }, [userData])

  const login = async (credentials: LoginRequest) => {
    await loginMutation.mutateAsync(credentials)
  }

  const register = async (userData: RegisterRequest) => {
    await registerMutation.mutateAsync(userData)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    queryClient.clear()
  }

  const updateProfile = async (userData: Partial<User>) => {
    await updateProfileMutation.mutateAsync(userData)
  }

  const calculateDNAFinanceiro = async (dnaData: DNAFinanceiroRequest) => {
    await dnaFinanceiroMutation.mutateAsync(dnaData)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    calculateDNAFinanceiro,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
