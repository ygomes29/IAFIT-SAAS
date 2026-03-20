import { HeartPulse, Save } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import Toggle from '../../components/ui/Toggle'
import { mockAgents } from '../../data/mockData'
import styles from './AgentPage.module.css'

export default function CustomerSuccess() {
  const agent = mockAgents.find(a => a.id === 'customer-success')

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrap}><HeartPulse size={28} /></div>
          <div className={styles.headerInfo}>
            <h2>{agent.name}</h2>
            <p>{agent.description}</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <StatusBadge status={agent.active ? 'active' : 'paused'} />
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics.atRisk}</div>
          <div className={styles.metricLabel}>Alunos em risco</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics.messaged}</div>
          <div className={styles.metricLabel}>Mensagens enviadas</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics.responses}</div>
          <div className={styles.metricLabel}>Respostas obtidas</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics.recovered}</div>
          <div className={styles.metricLabel}>Alunos recuperados</div>
        </div>
      </div>

      <div className={styles.configCard}>
        <h3 className={styles.configTitle}>Configuração do Agente</h3>
        <p className={styles.configDesc}>Defina quando o agente identifica um aluno em risco e como agir antes do cancelamento.</p>
        <div className={styles.configFields}>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Regra de ausência (dias)</label>
              <select className={styles.select} defaultValue="7">
                <option value="5">5 dias sem presença</option>
                <option value="7">7 dias sem presença</option>
                <option value="10">10 dias sem presença</option>
                <option value="14">14 dias sem presença</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Horário de envio</label>
              <input className={styles.input} defaultValue={agent.config.sendWindow} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Mensagem de incentivo</label>
            <textarea className={styles.textarea} defaultValue={agent.config.message} />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>CTA principal</label>
            <input className={styles.input} defaultValue={agent.config.cta} />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>Agente ativo</span>
              <span className={styles.toggleDesc}>O CS monitora automaticamente ausências e envia incentivos.</span>
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
