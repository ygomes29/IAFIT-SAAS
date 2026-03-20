import {
  Building2, User, MessageCircle, Plug, Activity,
  Shield, Users, Save, ChevronRight
} from 'lucide-react'
import { mockAcademy, mockIntegrations } from '../data/mockData'
import styles from './Settings.module.css'

const sections = [
  {
    id: 'academy',
    title: 'Dados da Academia',
    icon: Building2,
    fields: [
      { label: 'Nome da academia', value: mockAcademy.name },
      { label: 'Responsável', value: mockAcademy.responsible },
      { label: 'E-mail', value: mockAcademy.email, type: 'email' },
      { label: 'WhatsApp', value: mockAcademy.whatsapp },
    ],
  },
  {
    id: 'agent',
    title: 'Identidade do Agente',
    icon: User,
    fields: [
      { label: 'Nome do agente virtual', value: mockIntegrations.whatsapp.agentName },
      { label: 'Tom de voz', value: mockIntegrations.whatsapp.tone },
    ],
  },
  {
    id: 'channel',
    title: 'Canal de Atendimento',
    icon: MessageCircle,
    fields: [
      { label: 'WhatsApp oficial', value: mockIntegrations.whatsapp.number },
      { label: 'Assinatura padrão', value: 'Equipe Arena Fitness 💪' },
    ],
  },
  {
    id: 'w12',
    title: 'Integração W12',
    icon: Plug,
    fields: [
      { label: 'Filial', value: mockIntegrations.w12.branch },
      { label: 'ID da filial', value: mockIntegrations.w12.idBranch },
      { label: 'Ambiente', value: mockIntegrations.w12.environment },
      { label: 'Token', value: '••••••••••••••••', type: 'password' },
    ],
  },
  {
    id: 'n8n',
    title: 'Integração n8n',
    icon: Activity,
    fields: [
      { label: 'Webhook URL', value: mockIntegrations.n8n.webhookUrl },
      { label: 'Secret token', value: '••••••••••••', type: 'password' },
    ],
  },
]

export default function Settings() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Configurações</h2>
        <p className={styles.subtitle}>Gerencie dados da academia, agentes, integrações e permissões.</p>
      </div>

      <div className={styles.sections}>
        {sections.map(section => (
          <div key={section.id} className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}><section.icon size={18} /></div>
              <h3 className={styles.sectionTitle}>{section.title}</h3>
            </div>

            <div className={styles.fields}>
              {section.fields.map((field, i) => (
                <div key={i} className={styles.fieldRow}>
                  <label className={styles.fieldLabel}>{field.label}</label>
                  <input
                    className={styles.input}
                    defaultValue={field.value}
                    type={field.type || 'text'}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Permissions */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}><Shield size={18} /></div>
            <h3 className={styles.sectionTitle}>Permissões</h3>
          </div>
          <div className={styles.permNote}>
            Gerencie quem pode acessar e configurar a plataforma IAFIT da sua academia.
          </div>
          <div className={styles.permList}>
            <div className={styles.permItem}>
              <div className={styles.permAvatar}>CM</div>
              <div className={styles.permInfo}>
                <span className={styles.permName}>Carlos Mendes</span>
                <span className={styles.permRole}>Administrador</span>
              </div>
              <span className={styles.permBadge}>Owner</span>
            </div>
            <div className={styles.permItem}>
              <div className={styles.permAvatar}>JS</div>
              <div className={styles.permInfo}>
                <span className={styles.permName}>Julia Santos</span>
                <span className={styles.permRole}>Gerente</span>
              </div>
              <span className={styles.permBadge}>Editor</span>
            </div>
          </div>
          <button className={styles.addUserBtn}>
            <Users size={15} /> Adicionar usuário
          </button>
        </div>
      </div>

      <div className={styles.saveArea}>
        <button className={styles.saveBtn}>
          <Save size={16} /> Salvar todas as configurações
        </button>
      </div>
    </div>
  )
}
