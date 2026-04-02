-- ═══════════════════════════════════════════════════════════════
-- IAFIT CONTROL — Schema Completo
-- ═══════════════════════════════════════════════════════════════

-- ── Extensões ──────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Tabela: academies ──────────────────────────────────────────
create table if not exists public.academies (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  responsible   text,
  email         text,
  whatsapp      text,
  onboarding_completed boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── Tabela: profiles ───────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  academy_id    uuid references public.academies(id) on delete cascade,
  full_name     text,
  role          text default 'owner',
  created_at    timestamptz default now()
);

-- ── Tabela: integrations ───────────────────────────────────────
create table if not exists public.integrations (
  id                    uuid primary key default uuid_generate_v4(),
  academy_id            uuid not null references public.academies(id) on delete cascade,
  -- W12 / EVO
  w12_connected         boolean default false,
  w12_api_url           text,
  w12_token             text,
  w12_branch_id         text,
  w12_last_sync         timestamptz,
  -- n8n
  n8n_connected         boolean default false,
  n8n_url               text,
  n8n_api_key           text,
  n8n_last_sync         timestamptz,
  -- Evolution API
  evo_instance          text,
  evo_api_url           text,
  evo_api_key           text,
  -- Webhook
  webhook_url           text,
  webhook_secret        text,
  webhook_active        boolean default false,
  webhook_events_today  int default 0,
  -- OpenAI
  openai_api_key        text,
  -- Timestamps
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),
  unique(academy_id)
);

-- ── Tabela: agents ─────────────────────────────────────────────
create table if not exists public.agents (
  id              uuid primary key default uuid_generate_v4(),
  academy_id      uuid not null references public.academies(id) on delete cascade,
  slug            text not null,
  name            text not null,
  description     text,
  icon            text,
  active          boolean default false,
  config          jsonb default '{}',
  metrics         jsonb default '{}',
  last_execution  timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(academy_id, slug)
);

-- ── Tabela: agent_events ───────────────────────────────────────
create table if not exists public.agent_events (
  id           uuid primary key default uuid_generate_v4(),
  academy_id   uuid not null references public.academies(id) on delete cascade,
  agent_slug   text not null,
  agent_name   text,
  event_type   text,
  status       text default 'info', -- success | warning | error | pending | info
  message      text,
  phone        text,
  metadata     jsonb default '{}',
  created_at   timestamptz default now()
);

create index if not exists agent_events_academy_id_idx on public.agent_events(academy_id);
create index if not exists agent_events_created_at_idx on public.agent_events(created_at desc);
create index if not exists agent_events_agent_slug_idx on public.agent_events(agent_slug);

-- ── Tabela: metrics ────────────────────────────────────────────
create table if not exists public.metrics (
  id           uuid primary key default uuid_generate_v4(),
  academy_id   uuid not null references public.academies(id) on delete cascade,
  agent_slug   text not null,
  metric_key   text not null,
  value        numeric default 0,
  period       date not null default current_date,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique(academy_id, agent_slug, metric_key, period)
);

create index if not exists metrics_academy_period_idx on public.metrics(academy_id, period desc);

-- ── Tabela: contact_states ─────────────────────────────────────
-- Controla qual agente está "dono" de uma conversa ativa.
-- Criada pelo n8n quando um workflow envia mensagem.
-- Consumida pelo Roteador Central quando o aluno responde.
create table if not exists public.contact_states (
  id               uuid primary key default uuid_generate_v4(),
  academy_id       uuid not null references public.academies(id) on delete cascade,
  phone            text not null,
  active_agent     text not null, -- billing | cs | reactivation | followup | attendance
  workflow_origin  text,          -- nome do workflow que criou o estado
  context          jsonb default '{}',
  priority         int default 0, -- maior prioridade vence em caso de conflito
  messages_count   int default 0, -- quantas mensagens trocadas neste estado
  expires_at       timestamptz not null,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  unique(academy_id, phone)
);

create index if not exists contact_states_expires_idx on public.contact_states(expires_at);
create index if not exists contact_states_academy_phone_idx on public.contact_states(academy_id, phone);

-- ── Tabela: message_history ────────────────────────────────────
create table if not exists public.message_history (
  id           uuid primary key default uuid_generate_v4(),
  academy_id   uuid not null references public.academies(id) on delete cascade,
  phone        text not null,
  direction    text not null check (direction in ('inbound', 'outbound')),
  agent_slug   text,
  content      text,
  message_type text default 'text',
  metadata     jsonb default '{}',
  created_at   timestamptz default now()
);

create index if not exists message_history_phone_idx on public.message_history(academy_id, phone, created_at desc);

-- ════════════════════════════════════════════════════════════════
-- FUNÇÕES RPC (chamadas pelos workflows n8n)
-- ════════════════════════════════════════════════════════════════

-- ── get_active_state ───────────────────────────────────────────
-- Retorna o estado ativo de um contato (se não expirado).
-- Chamada pelo Roteador Central antes de rotear.
create or replace function public.get_active_state(
  p_academy_id uuid,
  p_phone      text
)
returns table (
  active_agent     text,
  workflow_origin  text,
  context          jsonb,
  priority         int,
  expires_at       timestamptz,
  messages_count   int
)
language sql
security definer
as $$
  select
    active_agent,
    workflow_origin,
    context,
    priority,
    expires_at,
    messages_count
  from public.contact_states
  where academy_id = p_academy_id
    and phone      = p_phone
    and expires_at > now()
  limit 1;
$$;

-- ── set_contact_state ──────────────────────────────────────────
-- Cria ou atualiza o estado de um contato.
-- Chamada pelos workflows de disparo ANTES de enviar mensagem.
create or replace function public.set_contact_state(
  p_academy_id   uuid,
  p_phone        text,
  p_agent        text,
  p_workflow     text,
  p_context      jsonb default '{}',
  p_priority     int  default 10,
  p_ttl_hours    int  default 24
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.contact_states
    (academy_id, phone, active_agent, workflow_origin, context, priority, expires_at, messages_count)
  values
    (p_academy_id, p_phone, p_agent, p_workflow, p_context, p_priority,
     now() + (p_ttl_hours || ' hours')::interval, 0)
  on conflict (academy_id, phone) do update set
    active_agent    = excluded.active_agent,
    workflow_origin = excluded.workflow_origin,
    context         = excluded.context,
    priority        = excluded.priority,
    expires_at      = excluded.expires_at,
    messages_count  = 0,
    updated_at      = now()
  where
    -- só sobrescreve se nova prioridade é >= existente (evita CS apagar Cobrança)
    contact_states.priority <= excluded.priority;
end;
$$;

-- ── clear_contact_state ────────────────────────────────────────
-- Remove o estado de um contato (pagamento feito, aluno recuperado, etc).
create or replace function public.clear_contact_state(
  p_academy_id uuid,
  p_phone      text,
  p_reason     text default null
)
returns void
language plpgsql
security definer
as $$
begin
  -- Registrar o motivo no histórico antes de deletar
  if p_reason is not null then
    insert into public.agent_events
      (academy_id, agent_slug, event_type, status, message, phone)
    select
      p_academy_id,
      active_agent,
      'state_cleared',
      'success',
      'Estado encerrado: ' || p_reason,
      p_phone
    from public.contact_states
    where academy_id = p_academy_id and phone = p_phone;
  end if;

  delete from public.contact_states
  where academy_id = p_academy_id and phone = p_phone;
end;
$$;

-- ── bump_contact_message ───────────────────────────────────────
-- Incrementa o contador de mensagens de um estado.
-- Chamada pelo Roteador após cada mensagem roteada.
create or replace function public.bump_contact_message(
  p_academy_id uuid,
  p_phone      text
)
returns void
language sql
security definer
as $$
  update public.contact_states
  set
    messages_count = messages_count + 1,
    updated_at     = now()
  where academy_id = p_academy_id
    and phone      = p_phone
    and expires_at > now();
$$;

-- ── handoff_contact ────────────────────────────────────────────
-- Transfere o "dono" da conversa de um agente para outro.
-- Preserva contexto original + adiciona contexto do handoff.
create or replace function public.handoff_contact(
  p_academy_id  uuid,
  p_phone       text,
  p_from_agent  text,
  p_to_agent    text,
  p_reason      text default 'handoff',
  p_new_context jsonb default '{}'
)
returns void
language plpgsql
security definer
as $$
declare
  v_old_context jsonb;
begin
  -- Pegar contexto atual para preservar
  select context into v_old_context
  from public.contact_states
  where academy_id = p_academy_id and phone = p_phone;

  -- Mesclar contexto antigo com novo (prefixado com _handoff_)
  update public.contact_states
  set
    active_agent    = p_to_agent,
    workflow_origin = 'handoff_from_' || p_from_agent,
    context         = coalesce(v_old_context, '{}') || p_new_context ||
                      jsonb_build_object(
                        '_handoff_from',   p_from_agent,
                        '_handoff_reason', p_reason,
                        '_handoff_at',     now()
                      ),
    priority        = 50, -- handoffs têm prioridade máxima
    expires_at      = now() + interval '2 hours',
    messages_count  = 0,
    updated_at      = now()
  where academy_id = p_academy_id and phone = p_phone;

  -- Log do evento
  insert into public.agent_events
    (academy_id, agent_slug, event_type, status, message, phone, metadata)
  values
    (p_academy_id, p_to_agent, 'handoff_received', 'info',
     'Handoff de ' || p_from_agent || ' → ' || p_to_agent || ': ' || p_reason,
     p_phone,
     jsonb_build_object('from', p_from_agent, 'reason', p_reason));
end;
$$;

-- ── cleanup_expired_states ─────────────────────────────────────
-- Remove estados expirados. Chamada pelo cron n8n a cada 15min.
create or replace function public.cleanup_expired_states()
returns int
language plpgsql
security definer
as $$
declare
  v_count int;
begin
  delete from public.contact_states
  where expires_at <= now();

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ── increment_metric ───────────────────────────────────────────
-- Incrementa (ou cria) uma métrica diária.
-- Chamada pelos workflows após cada ação mensurável.
create or replace function public.increment_metric(
  p_academy_id uuid,
  p_agent_slug text,
  p_metric_key text,
  p_value      numeric default 1
)
returns void
language sql
security definer
as $$
  insert into public.metrics (academy_id, agent_slug, metric_key, value, period)
  values (p_academy_id, p_agent_slug, p_metric_key, p_value, current_date)
  on conflict (academy_id, agent_slug, metric_key, period)
  do update set
    value      = metrics.value + excluded.value,
    updated_at = now();
$$;

-- ════════════════════════════════════════════════════════════════
-- TRIGGER: auto-update updated_at
-- ════════════════════════════════════════════════════════════════
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_academies_updated_at
  before update on public.academies
  for each row execute function public.touch_updated_at();

create trigger trg_integrations_updated_at
  before update on public.integrations
  for each row execute function public.touch_updated_at();

create trigger trg_agents_updated_at
  before update on public.agents
  for each row execute function public.touch_updated_at();

create trigger trg_contact_states_updated_at
  before update on public.contact_states
  for each row execute function public.touch_updated_at();

-- ════════════════════════════════════════════════════════════════
-- TRIGGER: handle_new_user
-- Cria profile automaticamente quando usuário é criado no Auth.
-- ════════════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, academy_id, full_name, role)
  values (
    new.id,
    (new.raw_user_meta_data->>'academy_id')::uuid,
    new.raw_user_meta_data->>'full_name',
    'owner'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════
alter table public.academies        enable row level security;
alter table public.profiles         enable row level security;
alter table public.integrations     enable row level security;
alter table public.agents           enable row level security;
alter table public.agent_events     enable row level security;
alter table public.metrics          enable row level security;
alter table public.contact_states   enable row level security;
alter table public.message_history  enable row level security;

-- Helper: retorna academy_id do usuário logado
create or replace function public.my_academy_id()
returns uuid language sql security definer stable as $$
  select academy_id from public.profiles where id = auth.uid();
$$;

-- academies: owner lê/atualiza a própria
create policy "owner_select_academy" on public.academies
  for select using (id = public.my_academy_id());
create policy "owner_update_academy" on public.academies
  for update using (id = public.my_academy_id());
-- insert é feito via signUp (antes do auth), precisa ser permitido para anon
create policy "anon_insert_academy" on public.academies
  for insert with check (true);

-- profiles
create policy "owner_select_profile" on public.profiles
  for select using (id = auth.uid());
create policy "owner_update_profile" on public.profiles
  for update using (id = auth.uid());

-- integrations, agents, events, metrics, contact_states, message_history:
-- usuário logado acessa apenas sua academia
create policy "academy_select" on public.integrations
  for select using (academy_id = public.my_academy_id());
create policy "academy_insert" on public.integrations
  for insert with check (academy_id = public.my_academy_id());
create policy "academy_update" on public.integrations
  for update using (academy_id = public.my_academy_id());

create policy "academy_select" on public.agents
  for select using (academy_id = public.my_academy_id());
create policy "academy_insert" on public.agents
  for insert with check (academy_id = public.my_academy_id());
create policy "academy_update" on public.agents
  for update using (academy_id = public.my_academy_id());

create policy "academy_select" on public.agent_events
  for select using (academy_id = public.my_academy_id());
create policy "academy_insert" on public.agent_events
  for insert with check (true); -- n8n insere via service_role, bypass RLS

create policy "academy_select" on public.metrics
  for select using (academy_id = public.my_academy_id());

create policy "academy_select" on public.contact_states
  for select using (academy_id = public.my_academy_id());

create policy "academy_select" on public.message_history
  for select using (academy_id = public.my_academy_id());
