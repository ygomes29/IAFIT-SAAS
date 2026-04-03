import { useState, useEffect } from 'react'
import {
  Plug, Activity, MessageCircle, Webhook,
  RefreshCw, Settings, CheckCircle2, XCircle, Clock, Loader2, ScrollText
} from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import styles from './Integrations.module.css'
import { useAuth } from '../contexts/AuthContext'
import { getIntegrations, updateIntegrations, testW12Connection, testWebhook } from '../lib/api'

function formatDate(dateStr) {
  if (!dateStr) return 'Nunca'
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function TestResult({ result }) {
  if (!result) return null
  return (
    <div className={`${styles.testResult} ${result.success ? styles.testOk : styles.testFail}`}>
      {result.success ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
      {result.message}
    </div>
  )
}

export default function Integrations() {
  const { academy } = useAuth()
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(null)
  const [testResults, setTestResults] = useState({})
  const [integrations, setIntegrations] = useState(null)

  useEffect(() => {
    if (!academy?.id) return

    async function loadData() {
      try {
        setLoading(true)
        const data = await getIntegrations(academy.id)
        setIntegrations(data)
      } catch {
        setIntegrations({ w12_connected: false, n8n_connected: false, webhook_active: false })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [academy?.id])

  const handleTest = async (id) => {
    if (!academy?.id) return
    setTesting(id)
    setTestResults(prev => ({ ...prev, [id]: null }))

    try {
      let result
      if (id === 'w12') {
        result = await testW12Connection({
          evo_dns: integrations?.w12_base_url,
          token: integrations?.w12_token,
          base_url: integrations?.w12_base_url,
        })
        if (result.success) {
          await updateIntegrations(academy.id, {
            w12_connected: true,
            w12_last_sync: new Date().toISOString(),
          })
          setIntegrations(prev => ({ ...prev, w12_connected: true, w12_last_sync: new Date().toISOString() }))
        }
      } else if (id === 'webhooks') {
        result = await testWebhook({
          webhook_url: integrations?.webhook_url,
          secret_token: integrations?.webhook_secret,
        })
        if (result.success) {
          await updateIntegrations(academy.id, {
            webhook_active: true,
            webhook_last_test: new Date().toISOString(),
          })
          setIntegrations(prev => ({ ...prev, webhook_active: true, webhook_last_test: new Date().toISOString() }))
        }
      } else {
        result = { success: true, message: 'Sem teste disponível para esta integração' }
      }

      setTestResults(prev => ({ ...prev, [id]: result }))
    } catch (err) {
      setTestResults(prev => ({ ...prev, [id]: { success: false, message: err.message } }))
    } finally {
      setTesting(null)
    }
  }

  const integrationCards = [
    {
      id: 'w12',
      title: 'W12 / EVO',
      desc: 'Sistema de gestão da academia',
      icon: Plug,
      connected: integrations?.w12_connected || false,
      lastSync: integrations?.w12_last_sync,
      details: [
        `Filial: ${integrations?.w12_branch_name || 'Não configurado'}`,
        `ID: ${integrations?.w12_branch_id || '-'}`,
        `Ambiente: ${integrations?.w12_environment || 'production'}`,
      ],
    },
    {
      id: 'n8n',
      title: 'n8n',
      desc: 'Motor de automação operacional',
      icon: Activity,
      connected: integrations?.n8n_connected || false,
      lastSync: integrations?.n8n_last_sync,
      details: [`Webhook: ${integrations?.n8n_webhook_url || 'Não configurado'}`],
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      desc: 'Canal principal de comunicação',
      icon: MessageCircle,
      connected: integrations?.whatsapp_connected || false,
      lastSync: new Date().toISOString(),
      details: [
        `Número: ${integrations?.whatsapp_number || 'Não configurado'}`,
        `Agente: ${integrations?.whatsapp_agent_name || '-'}`,
        `Tom: ${integrations?.whatsapp_tone || 'Amigável'}`,
      ],
    },
    {
      id: 'webhooks',
      title: 'Webhooks',
      desc: 'Eventos de integração em tempo real',
      icon: Webhook,
      connected: integrations?.webhook_active || false,
      lastSync: integrations?.webhook_last_event,
      details: [`Eventos hoje: ${integrations?.webhook_events_today || 0}`],
    },
    {
      id: 'logs',
      title: 'Logs',
      desc: 'Registros de operação do sistema',
      icon: ScrollText,
      connected: true,
      lastSync: new Date().toISOString(),
      details: ['Retenção: 30 dias', 'Nível: Info + Error'],
    },
  ]

  if (loading) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={40} className={styles.spinning} style={{ color: '#d4af37' }} />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Integrações</h2>
        <p className={styles.subtitle}>Gerencie as conexões da sua academia com os serviços da IAFIT.</p>
      </div>

      <div className={styles.grid}>
        {integrationCards.map(int => (
          <div key={int.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <int.icon size={22} />
              </div>
              <StatusBadge status={int.connected ? 'connected' : 'disconnected'} />
            </div>

            <h3 className={styles.cardTitle}>{int.title}</h3>
            <p className={styles.cardDesc}>{int.desc}</p>

            <div className={styles.details}>
              {int.details.map((d, i) => (
                <span key={i} className={styles.detailItem}>{d}</span>
              ))}
            </div>

            <div className={styles.cardMeta}>
              <Clock size={13} />
              <span>Última sync: {formatDate(int.lastSync)}</span>
            </div>

            <TestResult result={testResults[int.id]} />

            <div className={styles.cardActions}>
              {int.id !== 'logs' && (
                <button
                  className={styles.actionBtn}
                  onClick={() => handleTest(int.id)}
                  disabled={testing === int.id}
                >
                  {testing === int.id ? (
                    <><Loader2 size={14} className={styles.spinning} /> Testando...</>
                  ) : (
                    <><RefreshCw size={14} /> Testar</>
                  )}
                </button>
              )}
              <button className={styles.actionBtnSecondary}>
                <Settings size={14} /> Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
