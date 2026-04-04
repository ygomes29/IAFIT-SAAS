-- Migration: fix insecure RLS policies
-- 2026-04-04

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. agent_events INSERT
--    Antes: with check (true) → qualquer usuário autenticado podia inserir em
--           qualquer academy_id. n8n usa service_role (bypassa RLS de qualquer forma).
--    Agora: valida que academy_id pertence ao usuário autenticado.
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "academy_insert" on public.agent_events;
create policy "academy_insert" on public.agent_events
  for insert with check (academy_id = public.my_academy_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. academies INSERT
--    NOTA: o signup cria a academia ANTES de criar o usuário (fluxo anon).
--    Por isso, a policy precisa permitir anon. O risco de spam é mitigado pelo
--    rate limiting nativo do Supabase Auth.
--    Para hardening completo futuro: mover criação de academia para Edge Function
--    com service_role, e então restringir este INSERT para authenticated only.
--    Por ora, mantemos with check (true) com comentário documentado.
-- ─────────────────────────────────────────────────────────────────────────────
-- (sem alteração — comportamento mantido intencionalmente para o signup flow)
