// Edge Function: setup-academy
// Chamada no signup para criar os 5 agentes padrão + integrations vazia.
// Roda com service_role key — acesso total, sem RLS.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const DEFAULT_AGENTS = [
  {
    slug: 'follow-up',
    name: 'Follow-up Pós-Visita',
    description: 'Entra em contato com leads que visitaram mas não fecharam contrato.',
    icon: 'UserCheck',
    config: {
      window: '48h',
      channel: 'whatsapp',
      message: '',
      workflow_origin: 'followup_pos_visita',
      ttl_hours: 24,
      priority: 10,
    },
    metrics: { leads_contacted: 0, conversions: 0, conversion_rate: 0 },
  },
  {
    slug: 'customer-success',
    name: 'Customer Success',
    description: 'Monitora alunos em risco de churn e envia mensagens de retenção.',
    icon: 'HeartPulse',
    config: {
      absence_threshold_days: 7,
      channel: 'whatsapp',
      workflow_origin: 'cs_aluno_sumido',
      ttl_hours: 24,
      priority: 30,
    },
    metrics: { at_risk: 0, recovered: 0, recovery_rate: 0 },
  },
  {
    slug: 'reactivation',
    name: 'Reativação',
    description: 'Campanha automática para ex-alunos cancelados.',
    icon: 'RotateCcw',
    config: {
      campaign: '',
      offer: '',
      channel: 'whatsapp',
      workflow_origin: 'reativacao',
      ttl_hours: 72,
      priority: 20,
    },
    metrics: { contacted: 0, reactivated: 0, reactivation_rate: 0 },
  },
  {
    slug: 'billing',
    name: 'Cobrança Inteligente',
    description: 'Envia cobranças e PIX automáticos para inadimplentes.',
    icon: 'CreditCard',
    config: {
      channel: 'whatsapp',
      workflow_origin: 'cobranca_inadimplentes',
      ttl_hours: 48,
      priority: 40,
      send_pix: true,
    },
    metrics: { collections_sent: 0, amount_recovered: 0, recovery_rate: 0 },
  },
  {
    slug: 'attendance',
    name: 'Maria Júlia — Atendimento',
    description: 'Agente de atendimento com RAG e memória de conversação.',
    icon: 'MessageSquare',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 1000,
      system_prompt: '',
      enable_rag: true,
      enable_memory: true,
      webhook_evo: '',
      mcp_path: 'conceito',
      workflow_origin: 'attendance_maria_julia',
      ttl_hours: 4,
      priority: 5,
    },
    metrics: {
      conversations: 0,
      messages_sent: 0,
      response_rate: 0,
      avg_response_time: 0,
      satisfaction: 0,
    },
  },
  {
    slug: 'birthday',
    name: 'Feliz Aniversário',
    description: 'Parabeniza alunos automaticamente no aniversário com mensagem e oferta especial.',
    icon: 'Cake',
    config: {
      send_time: '09:00',
      message: '',
      offer: '',
      cta: 'Resgatar presente',
      channel: 'whatsapp',
      workflow_origin: 'birthday_message',
      ttl_hours: 24,
      priority: 15,
    },
    metrics: {
      birthdays_today: 0,
      messages_sent: 0,
      responses: 0,
      converted: 0,
    },
  },
]

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const { academy_id } = await req.json()

  if (!academy_id) {
    return new Response(JSON.stringify({ error: 'academy_id is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  try {
    // 1. Criar integrations vazia para a academia
    const { error: intError } = await supabase
      .from('integrations')
      .upsert({ academy_id }, { onConflict: 'academy_id', ignoreDuplicates: true })

    if (intError) {
      console.error('Error creating integrations:', intError)
    }

    // 2. Criar os 5 agentes padrão
    const agentsToInsert = DEFAULT_AGENTS.map((agent) => ({
      ...agent,
      academy_id,
    }))

    const { error: agentsError } = await supabase
      .from('agents')
      .upsert(agentsToInsert, { onConflict: 'academy_id,slug', ignoreDuplicates: true })

    if (agentsError) throw agentsError

    // 3. Registrar evento de setup
    await supabase.from('agent_events').insert({
      academy_id,
      agent_slug: 'sistema',
      event_type: 'academy_setup',
      status: 'success',
      message: 'Academia configurada com 6 agentes padrão.',
    })

    return new Response(
      JSON.stringify({ success: true, agents_created: DEFAULT_AGENTS.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('setup-academy error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
