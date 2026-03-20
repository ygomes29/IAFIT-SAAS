import { CreditCard, Save, Shield } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import Toggle from '../../components/ui/Toggle'
import { mockAgents } from '../../data/mockData'
import styles from './AgentPage.module.css'

export default function Billing() {
  const agent = mockAgents.find(a => a.id === 'billing')

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrap}><CreditCard size={28} /></div>
          <div className={styles.headerInfo}>
            <h2>{agent.name}</h2>
            <p>{agent.description}</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <StatusBadge status={agent.active ? 'active' : 'paused'} />
        </div>
      </div>

      {/* Elegant note */}
      <div className={styles.billingNote}>
        <Shield size={18} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>
          A cobrança inteligente da IAFIT é projetada para preservar a relação com o aluno. Ela cobra com empatia, oferece facilidade via PIX e pausa automaticamente quando detecta pagamento.
        </span>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics.identified}</div>
          <div className={styles.metricLabel}>Inadimplentes identificados</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics.sent}</div>
          <div className={styles.metricLabel}>Cobranças enviadas</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics.recovered}</div>
          <div className={styles.metricLabel}>Recuperações</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>R$ {agent.metrics.amountRecovered.toLocaleString('pt-BR')}</div>
          <div className={styles.metricLabel}>Valor recuperado</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics.ruleStatus}</div>
          <div className={styles.metricLabel}>Status da régua</div>
        </div>
      </div>

      <div className={styles.configCard}>
        <h3 className={styles.configTitle}>Configuração da Cobrança</h3>
        <p className={styles.configDesc}>Configure a régua de cobrança com tom amigável e foco em retenção.</p>
        <div className={styles.configFields}>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Prazo após recusa do cartão</label>
              <select className={styles.select} defaultValue="3">
                <option value="1">1 dia</option>
                <option value="2">2 dias</option>
                <option value="3">3 dias</option>
                <option value="5">5 dias</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Janela de envio</label>
              <input className={styles.input} defaultValue={agent.config.sendWindow} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Mensagem amigável</label>
            <textarea className={styles.textarea} defaultValue={agent.config.message} />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>CTA de pagamento</label>
            <input className={styles.input} defaultValue={agent.config.ctaPayment} />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>Pausa automática</span>
              <span className={styles.toggleDesc}>Pausa o envio automaticamente quando o pagamento é detectado.</span>
            </div>
            <Toggle checked={agent.config.autoPause} />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>Agente ativo</span>
              <span className={styles.toggleDesc}>Cobrança ativa sem constranger o aluno.</span>
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
