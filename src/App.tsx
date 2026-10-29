import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PortfolioProvider } from './context/PortfolioContext'
import { isSupabaseConfigured } from './lib/supabaseClient'
import LoginPage from './pages/LoginPage'
import PortfolioSelectionPage from './pages/PortfolioSelectionPage'
import DashboardPage from './pages/DashboardPage'
import SupabaseSetupNotice from './pages/SupabaseSetupNotice'
import DemoModeBanner from './components/DemoModeBanner'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-base-950 text-gray-400">
        Loading…
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/portfolios" replace /> : <LoginPage />}
      />
      <Route
        path="/portfolios"
        element={
          <ProtectedRoute>
            <PortfolioSelectionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portfolio/:portfolioId"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/portfolios" replace />} />
    </Routes>
  )
}

export default function App() {
  if (!isSupabaseConfigured) {
    return <SupabaseSetupNotice />
  }

  return (
    <AuthProvider>
      <PortfolioProvider>
        <DemoModeBanner />
        <AppRoutes />
      </PortfolioProvider>
    </AuthProvider>
  )
}
