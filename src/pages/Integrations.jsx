import { useState } from 'react'
import {
  Plug, Wifi, WifiOff, Activity, MessageCircle, Webhook,
  RefreshCw, Settings, CheckCircle2, XCircle, Clock, Loader, ScrollText
} from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import styles from './Integrations.module.css'
import { mockIntegrations } from '../data/mockData'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const integrations = [
  {
    id: 'w12',
    title: 'W12 / EVO',
    desc: 'Sistema de gestão da academia',
    icon: Plug,
    connected: mockIntegrations.w12.connected,
    status: mockIntegrations.w12.status,
    lastSync: mockIntegrations.w12.lastSync,
    details: [`Filial: ${mockIntegrations.w12.branch}`, `ID: ${mockIntegrations.w12.idBranch}`, `Ambiente: ${mockIntegrations.w12.environment}`],
  },
  {
    id: 'n8n',
    title: 'n8n',
    desc: 'Motor de automação operacional',
    icon: Activity,
    connected: mockIntegrations.n8n.connected,
    status: mockIntegrations.n8n.status,
    lastSync: mockIntegrations.n8n.lastSync,
    details: [`Webhook: ${mockIntegrations.n8n.webhookUrl}`],
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    desc: 'Canal principal de comunicação',
    icon: MessageCircle,
    connected: mockIntegrations.whatsapp.connected,
    status: 'healthy',
    lastSync: new Date().toISOString(),
    details: [`Número: ${mockIntegrations.whatsapp.number}`, `Agente: ${mockIntegrations.whatsapp.agentName}`, `Tom: ${mockIntegrations.whatsapp.tone}`],
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    desc: 'Eventos de integração em tempo real',
    icon: Webhook,
    connected: mockIntegrations.webhook.active,
    status: mockIntegrations.webhook.active ? 'healthy' : 'error',
    lastSync: mockIntegrations.webhook.lastEvent,
    details: [`Eventos hoje: ${mockIntegrations.webhook.eventsToday}`],
  },
  {
    id: 'logs',
    title: 'Logs',
    desc: 'Registros de operação do sistema',
    icon: ScrollText,
    connected: true,
    status: 'healthy',
    lastSync: new Date().toISOString(),
    details: ['Retenção: 30 dias', 'Nível: Info + Error'],
  },
]

export default function Integrations() {
  const [testing, setTesting] = useState(null)

  const handleTest = (id) => {
    setTesting(id)
    setTimeout(() => setTesting(null), 1500)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Integrações</h2>
        <p className={styles.subtitle}>Gerencie as conexões da sua academia com os serviços da IAFIT.</p>
      </div>

      <div className={styles.grid}>
        {integrations.map(int => (
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

            <div className={styles.cardActions}>
              <button
                className={styles.actionBtn}
                onClick={() => handleTest(int.id)}
                disabled={testing === int.id}
              >
                {testing === int.id ? (
                  <><Loader size={14} className={styles.spinning} /> Testando...</>
                ) : (
                  <><RefreshCw size={14} /> Testar</>
                )}
              </button>
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
