import { UserCheck, Save } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import Toggle from '../../components/ui/Toggle'
import { mockAgents } from '../../data/mockData'
import styles from './AgentPage.module.css'

export default function FollowUp() {
  const agent = mockAgents.find(a => a.id === 'follow-up')

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrap}><UserCheck size={28} /></div>
          <div className={styles.headerInfo}>
            <h2>{agent.name}</h2>
            <p>{agent.description}</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <StatusBadge status={agent.active ? 'active' : 'paused'} />
        </div>
      </div>

      {/* Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics.captured}</div>
          <div className={styles.metricLabel}>Visitas captadas</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics.sent}</div>
          <div className={styles.metricLabel}>Follow-ups enviados</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics.responseRate}%</div>
          <div className={styles.metricLabel}>Taxa de resposta</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics.openOpportunities}</div>
          <div className={styles.metricLabel}>Oportunidades abertas</div>
        </div>
      </div>

      {/* Config */}
      <div className={styles.configCard}>
        <h3 className={styles.configTitle}>Configuração do Agente</h3>
        <p className={styles.configDesc}>Defina como o agente de follow-up vai operar após uma visita à academia.</p>
        <div className={styles.configFields}>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Janela pós-visita</label>
              <select className={styles.select} defaultValue="48h">
                <option value="24h">24 horas</option>
                <option value="48h">48 horas</option>
                <option value="72h">72 horas</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Canal de envio</label>
              <select className={styles.select} defaultValue="whatsapp">
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Mensagem ativa</label>
            <textarea className={styles.textarea} defaultValue={agent.config.message} />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>Agente ativo</span>
              <span className={styles.toggleDesc}>O follow-up será enviado automaticamente após a visita.</span>
            </div>
            <Toggle checked={agent.config.active} />
          </div>

          <div className={styles.saveRow}>
            <button className={styles.saveBtn}><Save size={16} /> Salvar configurações</button>
          </div>
        </div>
      </div>
    </div>
  )
}
