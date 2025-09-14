import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Brain, 
  Radar, 
  Briefcase, 
  Settings,
  LogOut, 
  User,
  Menu,
  X,
  Bell
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useUnreadCount } from '../hooks/useAlerts'
import Button from './Button'
import NotificationCenter from './NotificationCenter'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false)
  const { data: unreadCount } = useUnreadCount()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'DNA Financeiro', href: '/dna-financeiro', icon: Brain },
    { name: 'Radar', href: '/radar', icon: Radar },
    { name: 'Estratégias', href: '/strategies', icon: Settings },
    { name: 'Portfólio', href: '/portfolio', icon: Briefcase },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Co-piloto Financeiro</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsNotificationCenterOpen(true)}
              className="relative p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Bell className="h-6 w-6" />
              {unreadCount && unreadCount.unread_count > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                  {unreadCount.unread_count > 9 ? '9+' : unreadCount.unread_count}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {isMobileMenuOpen && (
          <div className="bg-white border-b border-gray-200">
            <nav className="px-4 py-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>

      <div className="lg:flex">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900">Co-piloto Financeiro</h1>
            </div>
            
            <nav className="mt-8 flex-1 px-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            
            {/* Notifications */}
            <div className="px-4 py-2 border-t border-gray-200">
              <button
                onClick={() => setIsNotificationCenterOpen(true)}
                className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <div className="relative">
                  <Bell className="mr-3 h-5 w-5" />
                  {unreadCount && unreadCount.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                      {unreadCount.unread_count > 9 ? '9+' : unreadCount.unread_count}
                    </span>
                  )}
                </div>
                Notificações
              </button>
            </div>

            {/* User info */}
            <div className="px-4 py-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.email}</p>
                  <p className="text-xs text-gray-500">
                    {user?.investor_archetype?.replace('_', ' ').toUpperCase() || 'Perfil não definido'}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={logout}
                  className="ml-2"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={isNotificationCenterOpen} 
        onClose={() => setIsNotificationCenterOpen(false)} 
      />
    </div>
  )
}
