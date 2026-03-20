import { useState } from 'react'
import {
  UserCheck, HeartPulse, RotateCcw, CreditCard,
  AlertTriangle, CheckCircle2, Clock, Info, Filter
} from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import { mockEvents } from '../data/mockData'
import styles from './Logs.module.css'

const agentFilters = ['Todos', 'Follow-up', 'CS', 'Reativação', 'Cobrança', 'Sistema']
const statusFilters = ['Todos', 'success', 'warning', 'error', 'pending', 'info']

const eventIcons = {
  visit: UserCheck,
  risk: AlertTriangle,
  billing: CreditCard,
  reactivation: RotateCcw,
  followup: UserCheck,
  error: AlertTriangle,
}

export default function Logs() {
  const [agentFilter, setAgentFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Todos')

  const filtered = mockEvents.filter(e => {
    if (agentFilter !== 'Todos' && e.agent !== agentFilter) return false
    if (statusFilter !== 'Todos' && e.status !== statusFilter) return false
    return true
  })

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Logs & Eventos</h2>
          <p className={styles.subtitle}>Acompanhe a operação dos agentes de IA em tempo real.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <UserCheck size={18} className={styles.summaryIcon} />
          <div>
            <div className={styles.summaryValue}>14:45</div>
            <div className={styles.summaryLabel}>Última visita captada</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <HeartPulse size={18} className={styles.summaryIcon} />
          <div>
            <div className={styles.summaryValue}>14:30</div>
            <div className={styles.summaryLabel}>Último aluno em risco</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <CreditCard size={18} className={styles.summaryIcon} />
          <div>
            <div className={styles.summaryValue}>14:15</div>
            <div className={styles.summaryLabel}>Última cobrança identificada</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <RotateCcw size={18} className={styles.summaryIcon} />
          <div>
            <div className={styles.summaryValue}>13:50</div>
            <div className={styles.summaryLabel}>Último disparo reativação</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <Filter size={14} />
          <span className={styles.filterLabel}>Agente:</span>
          {agentFilters.map(f => (
            <button
              key={f}
              className={`${styles.filterChip} ${agentFilter === f ? styles.filterActive : ''}`}
              onClick={() => setAgentFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Status:</span>
          {statusFilters.map(f => (
            <button
              key={f}
              className={`${styles.filterChip} ${statusFilter === f ? styles.filterActive : ''}`}
              onClick={() => setStatusFilter(f)}
            >
              {f === 'Todos' ? f : <StatusBadge status={f} />}
            </button>
          ))}
        </div>
      </div>

      {/* Events Timeline */}
      <div className={styles.timeline}>
        {filtered.map(event => {
          const Icon = eventIcons[event.type] || Info
          return (
            <div key={event.id} className={styles.eventRow}>
              <div className={styles.eventTime}>
                <Clock size={12} />
                <span>{event.time}</span>
              </div>
              <div className={styles.eventLine}>
                <div className={`${styles.eventDot} ${styles[`dot_${event.status}`]}`} />
              </div>
              <div className={styles.eventContent}>
                <div className={styles.eventHeader}>
                  <Icon size={15} className={styles.eventIcon} />
                  <span className={styles.eventAgent}>{event.agent}</span>
                  <StatusBadge status={event.status} />
                </div>
                <p className={styles.eventMessage}>{event.message}</p>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className={styles.empty}>
            <Info size={24} />
            <p>Nenhum evento encontrado para os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  )
}
