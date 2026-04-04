import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Bot, Plug, ScrollText, Settings, ChevronLeft,
  UserCheck, HeartPulse, RotateCcw, CreditCard, MessageSquare, Cake, Zap, LogOut
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import styles from './Sidebar.module.css'

const mainNav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/integrations', icon: Plug, label: 'Integrações' },
  { to: '/logs', icon: ScrollText, label: 'Logs & Eventos' },
  { to: '/settings', icon: Settings, label: 'Configurações' },
]

const agentNav = [
  { to: '/agents/follow-up', icon: UserCheck, label: 'Follow-up' },
  { to: '/agents/customer-success', icon: HeartPulse, label: 'Customer Success' },
  { to: '/agents/reactivation', icon: RotateCcw, label: 'Reativação' },
  { to: '/agents/billing', icon: CreditCard, label: 'Cobrança' },
  { to: '/agents/attendance', icon: MessageSquare, label: 'Atendimento' },
  { to: '/agents/birthday', icon: Cake, label: 'Aniversário' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { profile, academy, signOut } = useAuth()
  const navigate = useNavigate()

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '??'

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.logoArea}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Zap size={20} />
          </div>
          {!collapsed && (
            <div className={styles.logoText}>
              <span className={styles.brand}>IAFIT</span>
              <span className={styles.sub}>Control</span>
            </div>
          )}
        </div>
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          <ChevronLeft size={16} className={collapsed ? styles.rotated : ''} />
        </button>
      </div>

      <nav className={styles.nav}>
        <div className={styles.section}>
          {!collapsed && <span className={styles.sectionLabel}>Principal</span>}
          {mainNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              title={item.label}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>

        <div className={styles.section}>
          {!collapsed && (
            <span className={styles.sectionLabel}>
              <Bot size={14} /> Agentes IA
            </span>
          )}
          {agentNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              title={item.label}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className={styles.footer}>
        {!collapsed && (
          <div className={styles.profile}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{profile?.full_name || 'Usuário'}</span>
              <span className={styles.profileRole}>{academy?.name || 'Minha Academia'}</span>
            </div>
          </div>
        )}
        <button className={styles.logoutBtn} title="Sair" onClick={handleSignOut}>
          <LogOut size={18} />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  )
}
