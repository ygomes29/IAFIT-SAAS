import { useNavigate } from 'react-router-dom'
import {
  DollarSign, Users, TrendingDown, Wallet,
  UserCheck, HeartPulse, RotateCcw, CreditCard,
  ArrowRight, Clock, AlertTriangle, Settings
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import MetricCard from '../components/ui/MetricCard'
import StatusBadge from '../components/ui/StatusBadge'
import styles from './Dashboard.module.css'
import { mockAgents, mockDashboardMetrics, mockChartData, mockEvents, mockIntegrations } from '../data/mockData'

const iconMap = { UserCheck, HeartPulse, RotateCcw, CreditCard }

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
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

export default function Dashboard() {
  const navigate = useNavigate()
  const m = mockDashboardMetrics

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
              <StatusBadge status={mockIntegrations.w12.connected ? 'connected' : 'disconnected'} label="W12 / EVO" />
              <span className={styles.chipTime}>
                <Clock size={12} /> {formatTime(mockIntegrations.w12.lastSync)}
              </span>
            </div>
            <div className={styles.chip}>
              <StatusBadge status={mockIntegrations.n8n.connected ? 'connected' : 'disconnected'} label="n8n" />
              <span className={styles.chipTime}>
                <Clock size={12} /> {formatTime(mockIntegrations.n8n.lastSync)}
              </span>
            </div>
            <div className={styles.chip}>
              <StatusBadge status={mockIntegrations.webhook.active ? 'active' : 'error'} label="Webhook" />
              <span className={styles.chipTime}>{mockIntegrations.webhook.eventsToday} eventos hoje</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Agentes de IA</h2>
        <span className={styles.sectionSub}>{mockAgents.filter(a => a.active).length} de {mockAgents.length} ativos</span>
      </div>

      <div className={styles.agentsGrid}>
        {mockAgents.map((agent, i) => {
          const Icon = iconMap[agent.icon]
          return (
            <div
              key={agent.id}
              className={`${styles.agentCard} animate-fade-in-delay-${i + 1}`}
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
                <span><Clock size={13} /> {formatTime(agent.lastExecution)}</span>
                <span>{agent.channel}</span>
              </div>
              <div className={styles.agentActions}>
                <button
                  className={styles.configBtn}
                  onClick={() => navigate(`/agents/${agent.id}`)}
                >
                  <Settings size={15} /> Configurar
                </button>
                <button
                  className={styles.detailBtn}
                  onClick={() => navigate(`/agents/${agent.id}`)}
                >
                  Ver detalhes <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )
        })}
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
            {mockEvents.slice(0, 6).map(event => (
              <div key={event.id} className={styles.eventItem}>
                <div className={styles.eventDot}>
                  <StatusBadge status={event.status} />
                </div>
                <div className={styles.eventContent}>
                  <p className={styles.eventMessage}>{event.message}</p>
                  <span className={styles.eventTime}>{event.time} · {event.agent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
