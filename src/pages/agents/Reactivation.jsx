import { RotateCcw, Save } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import Toggle from '../../components/ui/Toggle'
import { mockAgents } from '../../data/mockData'
import styles from './AgentPage.module.css'

export default function Reactivation() {
  const agent = mockAgents.find(a => a.id === 'reactivation')

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrap}><RotateCcw size={28} /></div>
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
          <div className={styles.metricValue}>{agent.metrics.inactiveBase}</div>
          <div className={styles.metricLabel}>Base inativa total</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics.eligible}</div>
          <div className={styles.metricLabel}>Elegíveis para campanha</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics.activeCampaigns}</div>
          <div className={styles.metricLabel}>Campanhas ativas</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics.responseRate}%</div>
          <div className={styles.metricLabel}>Taxa de resposta</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics.reactivated}</div>
          <div className={styles.metricLabel}>Reativações realizadas</div>
        </div>
      </div>

      <div className={styles.configCard}>
        <h3 className={styles.configTitle}>Configuração do Motor de Reativação</h3>
        <p className={styles.configDesc}>Configure campanhas cirúrgicas para reengajar ex-alunos e transformar a base inativa em receita.</p>
        <div className={styles.configFields}>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Janela de inatividade</label>
              <select className={styles.select} defaultValue="90">
                <option value="60">60 dias</option>
                <option value="90">90 dias</option>
                <option value="120">120 dias</option>
                <option value="180">180 dias</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Segmentação</label>
              <select className={styles.select} defaultValue="all">
                <option value="all">Todos os ex-alunos</option>
                <option value="recent">Saíram nos últimos 6 meses</option>
                <option value="old">Saíram há mais de 6 meses</option>
              </select>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Campanha ativa</label>
              <input className={styles.input} defaultValue={agent.config.campaign} />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Oferta</label>
              <input className={styles.input} defaultValue={agent.config.offer} />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Sazonalidade</label>
              <input className={styles.input} defaultValue={agent.config.seasonality} />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>CTA</label>
              <input className={styles.input} defaultValue={agent.config.cta} />
            </div>
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>Motor ativo</span>
              <span className={styles.toggleDesc}>A base inativa está pronta para reativação com campanhas automáticas.</span>
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
