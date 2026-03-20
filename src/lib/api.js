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

// ── Edge Functions ──
export async function testW12Connection({ token, base_url, branch_id }) {
  const { data, error } = await supabase.functions.invoke('test-w12', {
    body: { token, base_url, branch_id },
  })
  if (error) throw error
  return data
}

export async function testWebhook({ webhook_url, secret_token }) {
  const { data, error } = await supabase.functions.invoke('test-webhook', {
    body: { webhook_url, secret_token },
  })
  if (error) throw error
  return data
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
