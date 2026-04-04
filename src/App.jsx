import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AppLayout from './components/Layout/AppLayout'

const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const FollowUp = lazy(() => import('./pages/agents/FollowUp'))
const CustomerSuccess = lazy(() => import('./pages/agents/CustomerSuccess'))
const Reactivation = lazy(() => import('./pages/agents/Reactivation'))
const Billing = lazy(() => import('./pages/agents/Billing'))
const Attendance = lazy(() => import('./pages/agents/Attendance'))
const Birthday = lazy(() => import('./pages/agents/Birthday'))
const Integrations = lazy(() => import('./pages/Integrations'))
const Logs = lazy(() => import('./pages/Logs'))
const Settings = lazy(() => import('./pages/Settings'))

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
        <Suspense fallback={null}>
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
            <Route path="/agents/attendance" element={<Attendance />} />
            <Route path="/agents/birthday" element={<Birthday />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
