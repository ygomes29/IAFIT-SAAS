-- Migration: adicionar agente birthday para todas as academias existentes
-- Novas academias recebem via Edge Function setup-academy (já atualizada)

insert into public.agents (academy_id, slug, name, description, icon, active, config, metrics)
select
  id as academy_id,
  'birthday' as slug,
  'Feliz Aniversário' as name,
  'Parabeniza alunos automaticamente no aniversário com mensagem e oferta especial.' as description,
  'Cake' as icon,
  false as active,
  '{
    "send_time": "09:00",
    "message": "",
    "offer": "",
    "cta": "Resgatar presente",
    "channel": "whatsapp",
    "workflow_origin": "birthday_message",
    "ttl_hours": 24,
    "priority": 15
  }'::jsonb as config,
  '{
    "birthdays_today": 0,
    "messages_sent": 0,
    "responses": 0,
    "converted": 0
  }'::jsonb as metrics
from public.academies
on conflict (academy_id, slug) do nothing;
