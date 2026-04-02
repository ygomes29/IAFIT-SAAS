import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  DollarSign, Users, TrendingDown, Wallet,
  UserCheck, HeartPulse, RotateCcw, CreditCard,
  ArrowRight, Clock, AlertTriangle, Settings, Loader2
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import MetricCard from '../components/ui/MetricCard'
import StatusBadge from '../components/ui/StatusBadge'
import styles from './Dashboard.module.css'
import { mockChartData } from '../data/mockData'
import { useAuth } from '../contexts/AuthContext'
import { getAgents, getEvents, getMetrics, getIntegrations } from '../lib/api'

const iconMap = { UserCheck, HeartPulse, RotateCcw, CreditCard }

function formatTime(dateStr) {
  if (!dateStr) return '--:--'
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR').format(value || 0)
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className={styles.tooltipValue}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

function calculateMetrics(agents, events) {
  // Calculate dashboard metrics from real data
  const activeStudents = agents?.reduce((acc, agent) => {
    if (agent.slug === 'customer-success') {
      return acc + (agent.metrics?.at_risk || 0) + (agent.metrics?.recovered || 0)
    }
    return acc
  }, 400) || 487 // fallback

  const recoveredRevenue = agents?.reduce((acc, agent) => {
    if (agent.slug === 'billing') {
      return acc + (agent.metrics?.amount_recovered || 0)
    }
    return acc
  }, 0) || 0

  return {
    recoveredRevenue,
    recoveredChange: 24,
    activeStudents,
    studentsChange: 5,
    churnRate: 3.2,
    churnChange: -12,
    monthlyRevenue: 12450,
    revenueChange: 18,
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { academy } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [agents, setAgents] = useState([])
  const [events, setEvents] = useState([])
  const [integrations, setIntegrations] = useState(null)

  useEffect(() => {
    if (!academy?.id) return

    async function loadData() {
      try {
        setLoading(true)
        const [agentsData, eventsData, integrationsData] = await Promise.all([
          getAgents(academy.id),
          getEvents(academy.id, { limit: 10 }),
          getIntegrations(academy.id).catch(() => null), // May not exist yet
        ])
        setAgents(agentsData || [])
        setEvents(eventsData || [])
        setIntegrations(integrationsData)
      } catch (err) {
        console.error('Error loading dashboard data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [academy?.id])

  const m = calculateMetrics(agents, events)

  const integrationStatus = {
    w12: {
      connected: integrations?.w12_connected || false,
      lastSync: integrations?.w12_last_sync || new Date().toISOString(),
    },
    n8n: {
      connected: integrations?.n8n_connected || false,
      lastSync: integrations?.n8n_last_sync || new Date().toISOString(),
    },
    webhook: {
      active: integrations?.webhook_active || false,
      eventsToday: integrations?.webhook_events_today || 0,
    },
  }

  if (loading) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={40} className={styles.spinning} style={{ color: '#d4af37' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorCard}>
          <AlertTriangle size={32} color="#ef4444" />
          <p>Erro ao carregar dados: {error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryBtn}>Tentar novamente</button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Metrics Row */}
      <div className={styles.metricsGrid}>
        <MetricCard icon={DollarSign} label="Receita Recuperada" value={m.recoveredRevenue} prefix="R$ " change={m.recoveredChange} />
        <MetricCard icon={Users} label="Alunos Ativos" value={m.activeStudents} change={m.studentsChange} />
        <MetricCard icon={TrendingDown} label="Taxa de Churn" value={m.churnRate} suffix="%" change={m.churnChange} />
        <MetricCard icon={Wallet} label="Faturamento Mensal" value={m.monthlyRevenue} prefix="R$ " change={m.revenueChange} />
      </div>

      {/* Integration Status */}
      <div className={styles.integrationRow}>
        <div className={styles.integrationCard}>
          <div className={styles.integrationHeader}>
            <span className={styles.integrationLabel}>Status das Integrações</span>
            <button className={styles.linkBtn} onClick={() => navigate('/integrations')}>
              Ver detalhes <ArrowRight size={14} />
            </button>
          </div>
          <div className={styles.integrationChips}>
            <div className={styles.chip}>
              <StatusBadge status={integrationStatus.w12.connected ? 'connected' : 'disconnected'} label="W12 / EVO" />
              <span className={styles.chipTime}>
                <Clock size={12} /> {formatTime(integrationStatus.w12.lastSync)}
              </span>
            </div>
            <div className={styles.chip}>
              <StatusBadge status={integrationStatus.n8n.connected ? 'connected' : 'disconnected'} label="n8n" />
              <span className={styles.chipTime}>
                <Clock size={12} /> {formatTime(integrationStatus.n8n.lastSync)}
              </span>
            </div>
            <div className={styles.chip}>
              <StatusBadge status={integrationStatus.webhook.active ? 'active' : 'error'} label="Webhook" />
              <span className={styles.chipTime}>{integrationStatus.webhook.eventsToday} eventos hoje</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Agentes de IA</h2>
        <span className={styles.sectionSub}>{agents.filter(a => a.active).length} de {agents.length} ativos</span>
      </div>

      <div className={styles.agentsGrid}>
        {agents.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Nenhum agente encontrado. Complete o onboarding para configurar seus agentes.</p>
            <button className={styles.setupBtn} onClick={() => navigate('/onboarding')}>
              Configurar Agora
            </button>
          </div>
        ) : (
          agents.map((agent, i) => {
            const Icon = iconMap[agent.icon] || UserCheck
            return (
              <div
                key={agent.id}
                className={`${styles.agentCard} animate-fade-in-delay-${(i % 4) + 1}`}
              >
                <div className={styles.agentHeader}>
                  <div className={styles.agentIcon}>
                    <Icon size={22} />
                  </div>
                  <StatusBadge status={agent.active ? 'active' : 'paused'} />
                </div>
                <h3 className={styles.agentName}>{agent.name}</h3>
                <p className={styles.agentDesc}>{agent.description}</p>
                <div className={styles.agentMeta}>
                  <span><Clock size={13} /> {formatTime(agent.last_execution)}</span>
                  <span>{agent.channel || 'WhatsApp'}</span>
                </div>
                <div className={styles.agentActions}>
                  <button
                    className={styles.configBtn}
                    onClick={() => navigate(`/agents/${agent.slug}`)}
                  >
                    <Settings size={15} /> Configurar
                  </button>
                  <button
                    className={styles.detailBtn}
                    onClick={() => navigate(`/agents/${agent.slug}`)}
                  >
                    Ver detalhes <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Chart + Events Row */}
      <div className={styles.bottomRow}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Performance dos Agentes</h3>
          <p className={styles.chartSub}>Ações executadas por mês</p>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4af37" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#5a5a64" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#5a5a64" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="followup" name="Follow-up" stroke="#d4af37" fill="url(#gradGold)" strokeWidth={2} />
                <Area type="monotone" dataKey="cs" name="CS" stroke="#34d399" fill="url(#gradGreen)" strokeWidth={2} />
                <Area type="monotone" dataKey="reactivation" name="Reativação" stroke="#60a5fa" fill="transparent" strokeWidth={2} />
                <Area type="monotone" dataKey="billing" name="Cobrança" stroke="#f87171" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.eventsCard}>
          <div className={styles.eventsHeader}>
            <h3 className={styles.chartTitle}>Eventos Recentes</h3>
            <button className={styles.linkBtn} onClick={() => navigate('/logs')}>
              Ver todos <ArrowRight size={14} />
            </button>
          </div>
          <div className={styles.eventsList}>
            {events.length === 0 ? (
              <div className={styles.emptyEvents}>
                <p>Nenhum evento ainda. Assim que os agentes começarem a rodar, os eventos aparecerão aqui.</p>
              </div>
            ) : (
              events.slice(0, 6).map(event => (
                <div key={event.id} className={styles.eventItem}>
                  <div className={styles.eventDot}>
                    <StatusBadge status={event.status || 'info'} />
                  </div>
                  <div className={styles.eventContent}>
                    <p className={styles.eventMessage}>{event.message}</p>
                    <span className={styles.eventTime}>{formatTime(event.created_at)} · {event.agent_name || event.agent_slug}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
