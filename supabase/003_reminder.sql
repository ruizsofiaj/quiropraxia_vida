-- Recordatorios: cuándo Hugo le mandó el recordatorio por WhatsApp al paciente.
-- Ejecutar una vez en el editor SQL de Supabase.
alter table appointments add column if not exists reminder_sent_at timestamptz;
