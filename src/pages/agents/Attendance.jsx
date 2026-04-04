import { useState, useEffect } from 'react'
import { MessageSquare, Save, Loader2, AlertTriangle, Bot } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import Toggle from '../../components/ui/Toggle'
import styles from './AgentPage.module.css'
import { useAuth } from '../../contexts/AuthContext'
import { getAgent, updateAgent } from '../../lib/api'

export default function Attendance() {
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
        const data = await getAgent(academy.id, 'attendance')
        setAgent(data)
        setFormData({
          model: data.config?.model || 'gpt-4o-mini',
          temperature: data.config?.temperature || 0.7,
          maxTokens: data.config?.max_tokens || 1000,
          systemPrompt: data.config?.system_prompt || '',
          enableRag: data.config?.enable_rag !== false,
          enableMemory: data.config?.enable_memory !== false,
          webhookEvo: data.config?.webhook_evo || '',
          mcpPath: data.config?.mcp_path || 'conceito',
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
        <p>Agente não encontrado. Complete o onboarding primeiro.</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrap}><MessageSquare size={28} /></div>
          <div className={styles.headerInfo}>
            <h2>{agent.name}</h2>
            <p>{agent.description}</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <StatusBadge status={agent.active ? 'active' : 'paused'} />
        </div>
      </div>

      <div className={styles.billingNote}>
        <Bot size={18} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>
          A Maria Júlia é uma agente de atendimento inteligente com RAG (Retrieval Augmented Generation)
          e memória de conversação. Ela responde via WhatsApp usando conhecimento da base documental da academia
          e mantém contexto das conversas.
        </span>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics?.conversations || 0}</div>
          <div className={styles.metricLabel}>Conversas ativas</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics?.messages_sent || 0}</div>
          <div className={styles.metricLabel}>Mensagens enviadas</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics?.response_rate || 0}%</div>
          <div className={styles.metricLabel}>Taxa de resposta</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics?.avg_response_time || 0}s</div>
          <div className={styles.metricLabel}>Tempo médio resposta</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricValue}>{agent.metrics?.satisfaction || 0}%</div>
          <div className={styles.metricLabel}>Satisfação</div>
        </div>
      </div>

      <div className={styles.configCard}>
        <h3 className={styles.configTitle}>Configuração da Maria Júlia</h3>
        <p className={styles.configDesc}>Configure o comportamento da agente de atendimento inteligente.</p>

        <div className={styles.configFields}>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Modelo OpenAI</label>
              <select
                className={styles.select}
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              >
                <option value="gpt-4o-mini">GPT-4o Mini (rápido)</option>
                <option value="gpt-4o">GPT-4o (poderoso)</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (econômico)</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Temperatura</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                className={styles.input}
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Webhook EVO</label>
              <input
                className={styles.input}
                value={formData.webhookEvo}
                onChange={(e) => setFormData({ ...formData, webhookEvo: e.target.value })}
                placeholder="UUID do webhook"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Path MCP</label>
              <input
                className={styles.input}
                value={formData.mcpPath}
                onChange={(e) => setFormData({ ...formData, mcpPath: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>System Prompt</label>
            <textarea
              className={styles.textarea}
              rows={6}
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              placeholder="Instruções de comportamento da Maria Júlia..."
            />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>RAG (Base de Conhecimento)</span>
              <span className={styles.toggleDesc}>Permite a agente consultar documentos da academia.</span>
            </div>
            <Toggle
              checked={formData.enableRag}
              onChange={(checked) => setFormData({ ...formData, enableRag: checked })}
            />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>Memória de Conversação</span>
              <span className={styles.toggleDesc}>Mantém contexto das conversas anteriores com cada aluno.</span>
            </div>
            <Toggle
              checked={formData.enableMemory}
              onChange={(checked) => setFormData({ ...formData, enableMemory: checked })}
            />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>Agente ativo</span>
              <span className={styles.toggleDesc}>Maria Júlia responderá automaticamente às mensagens.</span>
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
                <><Save size={16} /> Salvar configurações</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
