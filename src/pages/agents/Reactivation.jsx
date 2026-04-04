import { useState, useEffect } from 'react'
import { RotateCcw, Save, Loader2, AlertTriangle } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import Toggle from '../../components/ui/Toggle'
import styles from './AgentPage.module.css'
import { useAuth } from '../../contexts/AuthContext'
import { getAgent, updateAgent } from '../../lib/api'

export default function Reactivation() {
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
        const data = await getAgent(academy.id, 'reactivation')
        setAgent(data)
        setFormData({
          inactivityWindow: data.config?.inactivity_window || 90,
          segment: data.config?.segment || 'all',
          campaign: data.config?.campaign || 'Volta Fitness 2026',
          offer: data.config?.offer || '30% desconto no trimestral',
          seasonality: data.config?.seasonality || 'Marco - Volta as aulas',
          cta: data.config?.cta || 'Quero voltar!',
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
          <div className={styles.metricValue}>{agent.metrics?.inactive_base || 0}</div>
          <div className={styles.metricLabel}>Base inativa total</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics?.eligible || 0}</div>
          <div className={styles.metricLabel}>Elegiveis para campanha</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics?.active_campaigns || 0}</div>
          <div className={styles.metricLabel}>Campanhas ativas</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics?.response_rate || 0}%</div>
          <div className={styles.metricLabel}>Taxa de resposta</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics?.reactivated || 0}</div>
          <div className={styles.metricLabel}>Reativacoes realizadas</div>
        </div>
      </div>

      <div className={styles.configCard}>
        <h3 className={styles.configTitle}>Configuracao do Motor de Reativacao</h3>
        <p className={styles.configDesc}>Configure campanhas cirurgicas para reengajar ex-alunos e transformar a base inativa em receita.</p>
        <div className={styles.configFields}>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Janela de inatividade</label>
              <select
                className={styles.select}
                value={formData.inactivityWindow}
                onChange={(e) => setFormData({ ...formData, inactivityWindow: parseInt(e.target.value) })}
              >
                <option value={60}>60 dias</option>
                <option value={90}>90 dias</option>
                <option value={120}>120 dias</option>
                <option value={180}>180 dias</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Segmentacao</label>
              <select
                className={styles.select}
                value={formData.segment}
                onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
              >
                <option value="all">Todos os ex-alunos</option>
                <option value="recent">Sairam nos ultimos 6 meses</option>
                <option value="old">Sairam ha mais de 6 meses</option>
              </select>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Campanha ativa</label>
              <input
                className={styles.input}
                value={formData.campaign}
                onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Oferta</label>
              <input
                className={styles.input}
                value={formData.offer}
                onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Sazonalidade</label>
              <input
                className={styles.input}
                value={formData.seasonality}
                onChange={(e) => setFormData({ ...formData, seasonality: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>CTA</label>
              <input
                className={styles.input}
                value={formData.cta}
                onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>Motor ativo</span>
              <span className={styles.toggleDesc}>A base inativa esta pronta para reativacao com campanhas automaticas.</span>
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
