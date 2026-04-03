import { supabase } from '../lib/supabase'

// ── Integrations ──
export async function getIntegrations(academyId) {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('academy_id', academyId)
    .single()
  if (error) throw error
  return data
}

export async function updateIntegrations(academyId, updates) {
  const { data, error } = await supabase
    .from('integrations')
    .update(updates)
    .eq('academy_id', academyId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Agents ──
export async function getAgents(academyId) {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('academy_id', academyId)
    .order('created_at')
  if (error) throw error
  return data
}

export async function getAgent(academyId, slug) {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('academy_id', academyId)
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

export async function updateAgent(agentId, updates) {
  const { data, error } = await supabase
    .from('agents')
    .update(updates)
    .eq('id', agentId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Events ──
export async function getEvents(academyId, { limit = 20, agentSlug, status } = {}) {
  let query = supabase
    .from('agent_events')
    .select('*')
    .eq('academy_id', academyId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (agentSlug && agentSlug !== 'Todos') {
    query = query.eq('agent_slug', agentSlug)
  }
  if (status && status !== 'Todos') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

// ── Metrics ──
export async function getMetrics(academyId, { months = 6 } = {}) {
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)

  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('academy_id', academyId)
    .gte('period', startDate.toISOString().split('T')[0])
    .order('period')
  if (error) throw error
  return data
}

// ── Academy ──
export async function updateAcademy(academyId, updates) {
  const { data, error } = await supabase
    .from('academies')
    .update(updates)
    .eq('id', academyId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Test functions (direct fetch — Edge Functions not deployed yet) ──
export async function testW12Connection({ evo_dns, token, base_url }) {
  const dns = evo_dns || base_url || ''
  const tok = token || ''
  try {
    const auth = btoa(`${dns}:${tok}`)
    const res = await fetch('https://evo-integracao-api.w12app.com.br/api/v1/configuration', {
      headers: { Authorization: `Basic ${auth}` },
    })
    if (res.ok) return { success: true, message: 'Conexão W12 válida' }
    if (res.status === 401) return { success: false, message: 'Token inválido' }
    return { success: false, message: `Erro HTTP ${res.status}` }
  } catch {
    return { success: false, message: 'Erro de conexão' }
  }
}

export async function testWebhook({ webhook_url, secret_token }) {
  if (!webhook_url) return { success: false, message: 'URL do webhook não configurada' }
  try {
    const res = await fetch(webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-iafit-secret': secret_token || '',
      },
      body: JSON.stringify({ test: true, source: 'iafit-control', timestamp: new Date().toISOString() }),
    })
    if (res.ok) return { success: true, message: 'Webhook respondeu OK' }
    return { success: false, message: `Webhook retornou ${res.status}` }
  } catch {
    return { success: false, message: 'Webhook não respondeu' }
  }
}

// ── Today's metrics per agent ──
export async function getTodayMetrics(academyId) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('academy_id', academyId)
    .eq('period', today)
  if (error) throw error
  return (data || []).reduce((acc, m) => { acc[m.agent_slug] = m; return acc }, {})
}

// ── Chart data: last 30 days grouped by period ──
export async function getChartData(academyId) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const { data, error } = await supabase
    .from('metrics')
    .select('period,agent_slug,followups_sent,messages_sent,reactivated,collections_sent')
    .eq('academy_id', academyId)
    .gte('period', thirtyDaysAgo.toISOString().split('T')[0])
    .order('period', { ascending: true })
  if (error) throw error

  const byPeriod = {}
  ;(data || []).forEach(m => {
    const d = new Date(m.period + 'T12:00:00')
    const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    if (!byPeriod[label]) byPeriod[label] = { month: label }
    const s = m.agent_slug
    if (s === 'follow-up')        byPeriod[label].followup    = (byPeriod[label].followup    || 0) + (m.followups_sent   || 0)
    if (s === 'customer-success') byPeriod[label].cs          = (byPeriod[label].cs          || 0) + (m.messages_sent    || 0)
    if (s === 'reactivation')     byPeriod[label].reactivation= (byPeriod[label].reactivation|| 0) + (m.reactivated      || 0)
    if (s === 'billing')          byPeriod[label].billing     = (byPeriod[label].billing     || 0) + (m.collections_sent || 0)
  })
  return Object.values(byPeriod)
}

// ── Onboarding ──
export async function completeOnboarding(academyId, data) {
  // Update academy
  await updateAcademy(academyId, {
    onboarding_completed: true,
    ...data.academy,
  })

  // Update integrations
  await updateIntegrations(academyId, {
    ...data.integrations,
  })

  // Update agent activation
  if (data.agents) {
    for (const [slug, active] of Object.entries(data.agents)) {
      const agent = await getAgent(academyId, slug)
      if (agent) {
        await updateAgent(agent.id, { active })
      }
    }
  }
}
