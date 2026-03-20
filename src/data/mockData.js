// Mock data for the IAFIT platform
export const mockAcademy = {
  name: 'Arena Fitness Premium',
  responsible: 'Carlos Mendes',
  whatsapp: '+55 11 99876-5432',
  email: 'carlos@arenafitness.com.br',
  branch: 'Unidade Centro',
  plan: 'IAFIT Pro',
  createdAt: '2025-12-15',
}

export const mockIntegrations = {
  w12: {
    connected: true,
    lastSync: '2026-03-19T14:30:00',
    status: 'healthy',
    branch: 'Arena Fitness - Centro',
    idBranch: 'br-001',
    environment: 'production',
  },
  n8n: {
    connected: true,
    lastSync: '2026-03-19T14:28:00',
    status: 'healthy',
    webhookUrl: 'https://n8n.processlabcorp.com.br/webhook/iafit-events',
  },
  webhook: {
    active: true,
    lastEvent: '2026-03-19T14:25:00',
    eventsToday: 47,
  },
  whatsapp: {
    connected: true,
    number: '+55 11 99876-5432',
    agentName: 'Lia',
    tone: 'Amigável e profissional',
  },
}

export const mockAgents = [
  {
    id: 'follow-up',
    name: 'Follow-up Pós-Visita',
    description: 'Acompanha quem visitou e ainda não converteu. Envia mensagens de forma natural e personalizada.',
    icon: 'UserCheck',
    active: true,
    channel: 'WhatsApp',
    lastExecution: '2026-03-19T13:45:00',
    metrics: {
      captured: 142,
      sent: 98,
      responseRate: 67,
      openOpportunities: 23,
    },
    config: {
      window: '48h',
      message: 'Oi {nome}! Tudo bem? Vi que você conheceu a {academia} 🏋️ Gostou da estrutura? Posso te ajudar com alguma dúvida sobre planos?',
      channel: 'WhatsApp',
      active: true,
    },
  },
  {
    id: 'customer-success',
    name: 'Customer Success',
    description: 'Identifica alunos que sumiram e age antes do cancelamento passivo.',
    icon: 'HeartPulse',
    active: true,
    channel: 'WhatsApp',
    lastExecution: '2026-03-19T12:30:00',
    metrics: {
      atRisk: 18,
      messaged: 34,
      responses: 21,
      recovered: 12,
    },
    config: {
      absenceDays: 7,
      message: 'Oi {nome}! Sentimos sua falta na {academia} 💪 Tá tudo bem? Seu treino te espera!',
      cta: 'Agendar treino',
      sendWindow: '09:00-20:00',
      active: true,
    },
  },
  {
    id: 'reactivation',
    name: 'Motor de Reativação',
    description: 'Reengaja ex-alunos com campanhas cirúrgicas e ofertas sazonais.',
    icon: 'RotateCcw',
    active: true,
    channel: 'WhatsApp',
    lastExecution: '2026-03-19T10:00:00',
    metrics: {
      inactiveBase: 340,
      eligible: 186,
      activeCampaigns: 2,
      responseRate: 24,
      reactivated: 31,
    },
    config: {
      inactivityWindow: '90 dias',
      segment: 'Todos os ex-alunos',
      campaign: 'Volta Fitness 2026',
      offer: '30% desconto no trimestral',
      seasonality: 'Março - Volta às aulas',
      cta: 'Quero voltar!',
      active: true,
    },
  },
  {
    id: 'billing',
    name: 'Cobrança Inteligente',
    description: 'Cobra de forma amigável e educada, preservando a retenção do aluno.',
    icon: 'CreditCard',
    active: false,
    channel: 'WhatsApp',
    lastExecution: '2026-03-18T18:00:00',
    metrics: {
      identified: 27,
      sent: 22,
      recovered: 15,
      amountRecovered: 4850,
      ruleStatus: 'Ativa',
    },
    config: {
      daysAfterDecline: 3,
      message: 'Oi {nome}! 😊 Notamos que houve um probleminha com o pagamento do seu plano. Sem estresse! Gerei um PIX pra facilitar:',
      ctaPayment: 'Pagar com PIX',
      sendWindow: '10:00-18:00',
      autoPause: true,
      active: false,
    },
  },
]

export const mockEvents = [
  { id: 1, type: 'visit', agent: 'Follow-up', message: 'Nova visita captada: Mariana Silva', time: '14:45', status: 'success', date: '2026-03-19' },
  { id: 2, type: 'risk', agent: 'CS', message: 'Aluno em risco identificado: João Pedro (8 dias ausente)', time: '14:30', status: 'warning', date: '2026-03-19' },
  { id: 3, type: 'billing', agent: 'Cobrança', message: 'Pagamento recuperado via PIX: R$ 189,90 — Lucas Martins', time: '14:15', status: 'success', date: '2026-03-19' },
  { id: 4, type: 'reactivation', agent: 'Reativação', message: 'Ex-aluna reativada: Fernanda Costa (campanha Volta Fitness)', time: '13:50', status: 'success', date: '2026-03-19' },
  { id: 5, type: 'followup', agent: 'Follow-up', message: 'Follow-up enviado: Rafael Santos — resposta pendente', time: '13:45', status: 'pending', date: '2026-03-19' },
  { id: 6, type: 'risk', agent: 'CS', message: 'Mensagem de incentivo enviada: Ana Paula (7 dias)', time: '13:20', status: 'info', date: '2026-03-19' },
  { id: 7, type: 'error', agent: 'Sistema', message: 'Timeout na sincronização W12 — reconectado automaticamente', time: '12:50', status: 'error', date: '2026-03-19' },
  { id: 8, type: 'billing', agent: 'Cobrança', message: 'Cobrança enviada: Diego Oliveira — PIX gerado', time: '12:30', status: 'info', date: '2026-03-19' },
  { id: 9, type: 'reactivation', agent: 'Reativação', message: 'Campanha "Volta Fitness" disparada para 42 ex-alunos', time: '10:00', status: 'success', date: '2026-03-19' },
  { id: 10, type: 'visit', agent: 'Follow-up', message: 'Nova visita captada: Bruno Almeida', time: '09:30', status: 'success', date: '2026-03-19' },
]

export const mockDashboardMetrics = {
  monthlyRevenue: 12450,
  revenueChange: 18,
  activeStudents: 487,
  studentsChange: 5,
  churnRate: 3.2,
  churnChange: -12,
  recoveredRevenue: 4850,
  recoveredChange: 24,
}

export const mockChartData = [
  { month: 'Out', followup: 45, cs: 12, reactivation: 8, billing: 15 },
  { month: 'Nov', followup: 52, cs: 18, reactivation: 14, billing: 19 },
  { month: 'Dez', followup: 61, cs: 15, reactivation: 22, billing: 21 },
  { month: 'Jan', followup: 78, cs: 22, reactivation: 18, billing: 25 },
  { month: 'Fev', followup: 85, cs: 28, reactivation: 26, billing: 22 },
  { month: 'Mar', followup: 98, cs: 34, reactivation: 31, billing: 27 },
]
