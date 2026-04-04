import { useState, useEffect } from 'react'
import { CreditCard, Save, Shield, Loader2, AlertTriangle } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import Toggle from '../../components/ui/Toggle'
import styles from './AgentPage.module.css'
import { useAuth } from '../../contexts/AuthContext'
import { getAgent, updateAgent } from '../../lib/api'

export default function Billing() {
  const { academy } = useAuth()
  const [agent, setAgent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    if (!academy?.id) return

    async function loadAgent() {
      try {
        setLoading(true)
        const data = await getAgent(academy.id, 'billing')
        setAgent(data)
        setFormData({
          daysAfterDecline: data.config?.days_after_decline || 3,
          sendWindow: data.config?.send_window || '10:00-18:00',
          message: data.config?.message || '',
          ctaPayment: data.config?.cta_payment || 'Pagar com PIX',
          autoPause: data.config?.auto_pause !== false,
          active: data.active || false,
        })
      } catch (err) {
        console.error('Error loading agent:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadAgent()
  }, [academy?.id])

  const handleSave = async () => {
    if (!agent) return
    try {
      setSaving(true)
      await updateAgent(agent.id, {
        active: formData.active,
        config: {
          ...agent.config,
          ...formData,
        },
      }, academy.id)
      setAgent({ ...agent, active: formData.active, config: { ...agent.config, ...formData } })
    } catch (err) {
      console.error('Erro ao salvar agente')
      alert('Erro ao salvar: ' + err.message)
    } finally {
      setSaving(false)
    }
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
          <p>Erro ao carregar agente: {error}</p>
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className={styles.page}>
        <p>Agente nao encontrado. Complete o onboarding primeiro.</p>
      </div>
    )
  }

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
          A cobranca inteligente da IAFIT e projetada para preservar a relacao com o aluno. Ela cobra com empatia, oferece facilidade via PIX e pausa automaticamente quando detecta pagamento.
        </span>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics?.identified || 0}</div>
          <div className={styles.metricLabel}>Inadimplentes identificados</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics?.sent || 0}</div>
          <div className={styles.metricLabel}>Cobrancas enviadas</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics?.recovered || 0}</div>
          <div className={styles.metricLabel}>Recuperacoes</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>R$ {new Intl.NumberFormat('pt-BR').format(agent.metrics?.amount_recovered || 0)}</div>
          <div className={styles.metricLabel}>Valor recuperado</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics?.rule_status || 'Ativa'}</div>
          <div className={styles.metricLabel}>Status da regua</div>
        </div>
      </div>

      <div className={styles.configCard}>
        <h3 className={styles.configTitle}>Configuracao da Cobranca</h3>
        <p className={styles.configDesc}>Configure a regua de cobranca com tom amigavel e foco em retencao.</p>
        <div className={styles.configFields}>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Prazo apos recusa do cartao</label>
              <select
                className={styles.select}
                value={formData.daysAfterDecline}
                onChange={(e) => setFormData({ ...formData, daysAfterDecline: parseInt(e.target.value) })}
              >
                <option value={1}>1 dia</option>
                <option value={2}>2 dias</option>
                <option value={3}>3 dias</option>
                <option value={5}>5 dias</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Janela de envio</label>
              <input
                className={styles.input}
                value={formData.sendWindow}
                onChange={(e) => setFormData({ ...formData, sendWindow: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Mensagem amigavel</label>
            <textarea
              className={styles.textarea}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>CTA de pagamento</label>
            <input
              className={styles.input}
              value={formData.ctaPayment}
              onChange={(e) => setFormData({ ...formData, ctaPayment: e.target.value })}
            />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>Pausa automatica</span>
              <span className={styles.toggleDesc}>Pausa o envio automaticamente quando o pagamento e detectado.</span>
            </div>
            <Toggle
              checked={formData.autoPause}
              onChange={(checked) => setFormData({ ...formData, autoPause: checked })}
            />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>Agente ativo</span>
              <span className={styles.toggleDesc}>Cobranca ativa sem constranger o aluno.</span>
            </div>
            <Toggle
              checked={formData.active}
              onChange={(checked) => setFormData({ ...formData, active: checked })}
            />
          </div>

          <div className={styles.saveRow}>
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <><Loader2 size={16} className={styles.spinning} /> Salvando...</>
              ) : (
                <><Save size={16} /> Salvar configuracoes</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
