import { useState, useEffect } from 'react'
import {
  UserCheck, HeartPulse, RotateCcw, CreditCard, MessageSquare,
  Clock, Info, Filter, Loader2, RefreshCw
} from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import styles from './Logs.module.css'
import { useAuth } from '../contexts/AuthContext'
import { getEvents } from '../lib/api'

const AGENT_FILTERS = ['Todos', 'follow-up', 'customer-success', 'reactivation', 'billing', 'attendance', 'sistema']
const AGENT_LABELS = {
  'follow-up': 'Follow-up',
  'customer-success': 'CS',
  'reactivation': 'Reativação',
  'billing': 'Cobrança',
  'attendance': 'Atendimento',
  'sistema': 'Sistema',
}
const STATUS_FILTERS = ['Todos', 'success', 'warning', 'error', 'pending', 'info']

const AGENT_ICONS = {
  'follow-up': UserCheck,
  'customer-success': HeartPulse,
  'reactivation': RotateCcw,
  'billing': CreditCard,
  'attendance': MessageSquare,
  'sistema': Info,
}

function formatTime(dateStr) {
  if (!dateStr) return '--:--'
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function Logs() {
  const { academy } = useAuth()
  const [agentFilter, setAgentFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadEvents() {
    if (!academy?.id) return
    try {
      setLoading(true)
      const data = await getEvents(academy.id, {
        limit: 100,
        agentSlug: agentFilter !== 'Todos' ? agentFilter : undefined,
        status: statusFilter !== 'Todos' ? statusFilter : undefined,
      })
      setEvents(data || [])
    } catch (err) {
      console.error('Error loading events:', err)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [academy?.id, agentFilter, statusFilter])

  // Summary: last event per agent type
  const lastByAgent = ['follow-up', 'customer-success', 'billing', 'reactivation'].reduce((acc, slug) => {
    const found = events.find(e => e.agent_slug === slug)
    acc[slug] = found ? formatTime(found.created_at) : '—'
    return acc
  }, {})

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Logs & Eventos</h2>
          <p className={styles.subtitle}>Acompanhe a operação dos agentes de IA em tempo real.</p>
        </div>
        <button className={styles.refreshBtn} onClick={loadEvents} disabled={loading}>
          <RefreshCw size={15} className={loading ? styles.spinning : ''} />
          Atualizar
        </button>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <UserCheck size={18} className={styles.summaryIcon} />
          <div>
            <div className={styles.summaryValue}>{lastByAgent['follow-up']}</div>
            <div className={styles.summaryLabel}>Última visita captada</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <HeartPulse size={18} className={styles.summaryIcon} />
          <div>
            <div className={styles.summaryValue}>{lastByAgent['customer-success']}</div>
            <div className={styles.summaryLabel}>Último aluno em risco</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <CreditCard size={18} className={styles.summaryIcon} />
          <div>
            <div className={styles.summaryValue}>{lastByAgent['billing']}</div>
            <div className={styles.summaryLabel}>Última cobrança</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <RotateCcw size={18} className={styles.summaryIcon} />
          <div>
            <div className={styles.summaryValue}>{lastByAgent['reactivation']}</div>
            <div className={styles.summaryLabel}>Último disparo reativação</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <Filter size={14} />
          <span className={styles.filterLabel}>Agente:</span>
          {AGENT_FILTERS.map(f => (
            <button
              key={f}
              className={`${styles.filterChip} ${agentFilter === f ? styles.filterActive : ''}`}
              onClick={() => setAgentFilter(f)}
            >
              {f === 'Todos' ? 'Todos' : (AGENT_LABELS[f] || f)}
            </button>
          ))}
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Status:</span>
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              className={`${styles.filterChip} ${statusFilter === f ? styles.filterActive : ''}`}
              onClick={() => setStatusFilter(f)}
            >
              {f === 'Todos' ? 'Todos' : <StatusBadge status={f} />}
            </button>
          ))}
        </div>
      </div>

      {/* Events Timeline */}
      {loading ? (
        <div className={styles.loadingWrap}>
          <Loader2 size={32} className={styles.spinning} style={{ color: '#d4af37' }} />
        </div>
      ) : (
        <div className={styles.timeline}>
          {events.map(event => {
            const Icon = AGENT_ICONS[event.agent_slug] || Info
            return (
              <div key={event.id} className={styles.eventRow}>
                <div className={styles.eventTime}>
                  <Clock size={12} />
                  <span>{formatTime(event.created_at)}</span>
                </div>
                <div className={styles.eventLine}>
                  <div className={`${styles.eventDot} ${styles[`dot_${event.status}`]}`} />
                </div>
                <div className={styles.eventContent}>
                  <div className={styles.eventHeader}>
                    <Icon size={15} className={styles.eventIcon} />
                    <span className={styles.eventAgent}>
                      {event.agent_name || AGENT_LABELS[event.agent_slug] || event.agent_slug}
                    </span>
                    <StatusBadge status={event.status} />
                  </div>
                  <p className={styles.eventMessage}>{event.message}</p>
                </div>
              </div>
            )
          })}
          {events.length === 0 && (
            <div className={styles.empty}>
              <Info size={24} />
              <p>Nenhum evento encontrado. Assim que os agentes operarem, os logs aparecerão aqui.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
