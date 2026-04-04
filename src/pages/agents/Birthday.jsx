import { useState, useEffect } from 'react'
import { Cake, Save, Loader2, AlertTriangle } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import Toggle from '../../components/ui/Toggle'
import styles from './AgentPage.module.css'
import { useAuth } from '../../contexts/AuthContext'
import { getAgent, updateAgent } from '../../lib/api'

export default function Birthday() {
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
        const data = await getAgent(academy.id, 'birthday')
        setAgent(data)
        setFormData({
          sendTime: data.config?.send_time || '09:00',
          message: data.config?.message || '',
          offer: data.config?.offer || '',
          cta: data.config?.cta || 'Resgatar presente',
          active: data.active || false,
        })
      } catch (err) {
        console.error('Erro ao carregar agente birthday')
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
          send_time: formData.sendTime,
          message: formData.message,
          offer: formData.offer,
          cta: formData.cta,
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
          <div className={styles.iconWrap}><Cake size={28} /></div>
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
          <div className={styles.metricValue}>{agent.metrics?.birthdays_today || 0}</div>
          <div className={styles.metricLabel}>Aniversários hoje</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics?.messages_sent || 0}</div>
          <div className={styles.metricLabel}>Mensagens enviadas</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics?.responses || 0}</div>
          <div className={styles.metricLabel}>Respostas obtidas</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics?.converted || 0}</div>
          <div className={styles.metricLabel}>Conversões</div>
        </div>
      </div>

      <div className={styles.configCard}>
        <h3 className={styles.configTitle}>Configuracao do Agente</h3>
        <p className={styles.configDesc}>Defina quando e como o agente parabeniza os alunos no dia do aniversario.</p>
        <div className={styles.configFields}>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Horario de envio</label>
              <input
                className={styles.input}
                type="time"
                value={formData.sendTime}
                onChange={(e) => setFormData({ ...formData, sendTime: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Oferta especial (opcional)</label>
              <input
                className={styles.input}
                placeholder="Ex: 1 mes gratis, 20% de desconto..."
                value={formData.offer}
                onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Mensagem de parabenizacao</label>
            <textarea
              className={styles.textarea}
              placeholder="Ex: Feliz aniversario! A [academia] tem um presente especial pra voce hoje..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>CTA principal</label>
            <input
              className={styles.input}
              value={formData.cta}
              onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
            />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>Agente ativo</span>
              <span className={styles.toggleDesc}>O agente verifica aniversarios diariamente e envia a mensagem no horario configurado.</span>
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
