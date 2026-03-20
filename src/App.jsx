import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AppLayout from './components/Layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import FollowUp from './pages/agents/FollowUp'
import CustomerSuccess from './pages/agents/CustomerSuccess'
import Reactivation from './pages/agents/Reactivation'
import Billing from './pages/agents/Billing'
import Integrations from './pages/Integrations'
import Logs from './pages/Logs'
import Settings from './pages/Settings'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--accent)',
        fontSize: '1.1rem',
        fontWeight: 600,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '3px solid var(--border-secondary)',
            borderTopColor: 'var(--accent)',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          Carregando IAFIT...
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return null

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            <PublicRoute><Login /></PublicRoute>
          } />
          <Route path="/onboarding" element={
            <ProtectedRoute><Onboarding /></ProtectedRoute>
          } />

          {/* Protected routes (with layout) */}
          <Route element={
            <ProtectedRoute><AppLayout /></ProtectedRoute>
          }>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agents/follow-up" element={<FollowUp />} />
            <Route path="/agents/customer-success" element={<CustomerSuccess />} />
            <Route path="/agents/reactivation" element={<Reactivation />} />
            <Route path="/agents/billing" element={<Billing />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
