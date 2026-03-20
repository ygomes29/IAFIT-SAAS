import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, Plug, Webhook, MessageSquare, Bot,
  Check, ChevronRight, ChevronLeft, Zap, Loader,
  UserCheck, HeartPulse, RotateCcw, CreditCard, CheckCircle2, XCircle
} from 'lucide-react'
import Toggle from '../components/ui/Toggle'
import styles from './Onboarding.module.css'

const steps = [
  { id: 1, label: 'Academia', icon: Building2 },
  { id: 2, label: 'W12 / EVO', icon: Plug },
  { id: 3, label: 'Webhook', icon: Webhook },
  { id: 4, label: 'Canal', icon: MessageSquare },
  { id: 5, label: 'Agentes', icon: Bot },
]

const agentOptions = [
  { id: 'follow-up', name: 'Follow-up Pós-Visita', desc: 'Acompanha quem visitou e não converteu.', icon: UserCheck },
  { id: 'customer-success', name: 'Customer Success', desc: 'Identifica alunos sumidos e age antes do churn.', icon: HeartPulse },
  { id: 'reactivation', name: 'Motor de Reativação', desc: 'Reengaja ex-alunos com campanhas cirúrgicas.', icon: RotateCcw },
  { id: 'billing', name: 'Cobrança Inteligente', desc: 'Cobra de forma amigável preservando retenção.', icon: CreditCard },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [webhookTest, setWebhookTest] = useState(null)
  const [agents, setAgents] = useState({ 'follow-up': true, 'customer-success': true, 'reactivation': true, 'billing': false })
  const [connectionType, setConnectionType] = useState('single')

  const simulateTest = (setter) => {
    setTesting(true)
    setter(null)
    setTimeout(() => {
      setTesting(false)
      setter('success')
    }, 1500)
  }

  const handleFinish = () => navigate('/')

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.brand}>
            <div className={styles.logoIcon}><Zap size={22} /></div>
            <div>
              <span className={styles.brandName}>IAFIT</span>
              <span className={styles.brandSub}>Setup</span>
            </div>
          </div>
          <p className={styles.headerSub}>Configure sua academia em poucos passos e ative seus agentes de IA.</p>
        </div>

        {/* Step Indicator */}
        <div className={styles.steps}>
          {steps.map((s, i) => (
            <div key={s.id} className={`${styles.stepItem} ${step === s.id ? styles.stepActive : ''} ${step > s.id ? styles.stepDone : ''}`}>
              <div className={styles.stepCircle}>
                {step > s.id ? <Check size={16} /> : <s.icon size={16} />}
              </div>
              <span className={styles.stepLabel}>{s.label}</span>
              {i < steps.length - 1 && <div className={`${styles.stepLine} ${step > s.id ? styles.stepLineDone : ''}`} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className={styles.card}>
          {step === 1 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Dados da Academia</h2>
              <p className={styles.stepDesc}>Informações básicas para personalizar a experiência dos seus agentes.</p>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Nome da academia</label>
                  <input className={styles.input} placeholder="Ex: Arena Fitness Premium" defaultValue="Arena Fitness Premium" />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Nome do responsável</label>
                  <input className={styles.input} placeholder="Ex: Carlos Mendes" defaultValue="Carlos Mendes" />
                </div>
                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>WhatsApp principal</label>
                    <input className={styles.input} placeholder="+55 11 99999-0000" defaultValue="+55 11 99876-5432" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>E-mail</label>
                    <input className={styles.input} type="email" placeholder="seu@email.com" defaultValue="carlos@arenafitness.com.br" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Conexão W12 / EVO</h2>
              <p className={styles.stepDesc}>
                Conecte sua academia ao W12 para que a IAFIT consiga identificar visitas, inadimplência, alunos inativos e eventos importantes.
              </p>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Tipo de conexão</label>
                  <div className={styles.radioGroup}>
                    <label className={`${styles.radioOption} ${connectionType === 'single' ? styles.radioActive : ''}`}>
                      <input type="radio" name="connType" value="single" checked={connectionType === 'single'} onChange={() => setConnectionType('single')} />
                      <span>Filial Única</span>
                    </label>
                    <label className={`${styles.radioOption} ${connectionType === 'multi' ? styles.radioActive : ''}`}>
                      <input type="radio" name="connType" value="multi" checked={connectionType === 'multi'} onChange={() => setConnectionType('multi')} />
                      <span>Multifilial</span>
                    </label>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Token da API</label>
                  <input className={styles.input} placeholder="Cole o token aqui" type="password" />
                </div>
                {connectionType === 'multi' && (
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>idBranch</label>
                    <input className={styles.input} placeholder="Ex: br-001" />
                  </div>
                )}
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>URL Base (pré-preenchida)</label>
                  <input className={styles.input} defaultValue="https://evo-integracao.w12app.com.br/api/v1" readOnly />
                </div>

                <button className={styles.testBtn} onClick={() => simulateTest(setTestResult)} disabled={testing}>
                  {testing ? <><Loader size={16} className={styles.spinning} /> Testando...</> :
                   testResult === 'success' ? <><CheckCircle2 size={16} /> Conexão validada</> :
                   'Testar Conexão'}
                </button>
                {testResult === 'success' && (
                  <div className={styles.successMsg}>
                    <CheckCircle2 size={16} /> Token válido · Filial encontrada · Integração pronta
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Webhook / n8n</h2>
              <p className={styles.stepDesc}>
                A IAFIT usa o n8n como motor operacional das automações. Configure o webhook para conectar.
              </p>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>URL do Webhook</label>
                  <input className={styles.input} placeholder="https://n8n.seudominio.com/webhook/..." />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Secret / Header Token</label>
                  <input className={styles.input} placeholder="Token de autenticação" type="password" />
                </div>
                <div className={styles.fieldRow}>
                  <button className={styles.testBtn} onClick={() => simulateTest(setWebhookTest)} disabled={testing}>
                    {testing ? <><Loader size={16} className={styles.spinning} /> Validando...</> :
                     webhookTest === 'success' ? <><CheckCircle2 size={16} /> Webhook validado</> :
                     'Validar Webhook'}
                  </button>
                  <button className={`${styles.testBtn} ${styles.testBtnSecondary}`} disabled={testing}>
                    Testar Envio
                  </button>
                </div>
                {webhookTest === 'success' && (
                  <div className={styles.successMsg}>
                    <CheckCircle2 size={16} /> Webhook operacional · Resposta 200 OK
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Canal de Saída</h2>
              <p className={styles.stepDesc}>
                Configure como seus agentes vão se comunicar com os alunos e leads.
              </p>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Número de WhatsApp oficial</label>
                  <input className={styles.input} placeholder="+55 11 99999-0000" defaultValue="+55 11 99876-5432" />
                </div>
                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Nome do agente virtual</label>
                    <input className={styles.input} placeholder="Ex: Lia" defaultValue="Lia" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Tom de voz</label>
                    <select className={styles.select} defaultValue="friendly">
                      <option value="friendly">Amigável e profissional</option>
                      <option value="formal">Formal e direto</option>
                      <option value="casual">Casual e descontraído</option>
                    </select>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Assinatura padrão das mensagens</label>
                  <input className={styles.input} placeholder="Ex: Equipe Arena Fitness" defaultValue="Equipe Arena Fitness 💪" />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Ativar Agentes</h2>
              <p className={styles.stepDesc}>
                Escolha quais agentes de IA você quer ativar agora. Você pode configurar cada um em detalhes depois.
              </p>
              <div className={styles.agentGrid}>
                {agentOptions.map(agent => (
                  <div key={agent.id} className={`${styles.agentOption} ${agents[agent.id] ? styles.agentActive : ''}`}>
                    <div className={styles.agentOptionHeader}>
                      <div className={styles.agentOptionIcon}>
                        <agent.icon size={20} />
                      </div>
                      <Toggle
                        checked={agents[agent.id]}
                        onChange={(v) => setAgents(prev => ({ ...prev, [agent.id]: v }))}
                      />
                    </div>
                    <h4 className={styles.agentOptionName}>{agent.name}</h4>
                    <p className={styles.agentOptionDesc}>{agent.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className={styles.navRow}>
            {step > 1 && (
              <button className={styles.backBtn} onClick={() => setStep(s => s - 1)}>
                <ChevronLeft size={18} /> Voltar
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < 5 ? (
              <button className={styles.nextBtn} onClick={() => setStep(s => s + 1)}>
                Continuar <ChevronRight size={18} />
              </button>
            ) : (
              <button className={styles.finishBtn} onClick={handleFinish}>
                <Zap size={18} /> Ativar IAFIT
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
