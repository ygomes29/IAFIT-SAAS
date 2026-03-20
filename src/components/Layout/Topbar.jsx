import { useLocation } from 'react-router-dom'
import { Bell, Wifi, WifiOff, Activity } from 'lucide-react'
import styles from './Topbar.module.css'
import { mockIntegrations } from '../../data/mockData'

const routeTitles = {
  '/': 'Dashboard',
  '/agents/follow-up': 'Follow-up Pós-Visita',
  '/agents/customer-success': 'Customer Success',
  '/agents/reactivation': 'Motor de Reativação',
  '/agents/billing': 'Cobrança Inteligente',
  '/integrations': 'Integrações',
  '/logs': 'Logs & Eventos',
  '/settings': 'Configurações',
  '/onboarding': 'Onboarding',
}

export default function Topbar() {
  const location = useLocation()
  const title = routeTitles[location.pathname] || 'IAFIT Control'
  const { w12, n8n, webhook } = mockIntegrations

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <h1 className={styles.title}>{title}</h1>
      </div>
      <div className={styles.right}>
        <div className={styles.statusGroup}>
          <div className={`${styles.statusChip} ${w12.connected ? styles.connected : styles.disconnected}`}>
            {w12.connected ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>W12</span>
          </div>
          <div className={`${styles.statusChip} ${n8n.connected ? styles.connected : styles.disconnected}`}>
            <Activity size={14} />
            <span>n8n</span>
          </div>
          <div className={`${styles.statusChip} ${webhook.active ? styles.connected : styles.disconnected}`}>
            <div className={`${styles.dot} ${webhook.active ? styles.dotActive : styles.dotInactive}`} />
            <span>Webhook</span>
          </div>
        </div>
        <button className={styles.bellBtn} aria-label="Notificações">
          <Bell size={20} />
          <span className={styles.bellDot} />
        </button>
      </div>
    </header>
  )
}
