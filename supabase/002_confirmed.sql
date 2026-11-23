-- Marca "Confirmado": cuándo Hugo confirmó el turno por WhatsApp.
-- Ejecutar una vez en el editor SQL de Supabase.
alter table appointments add column if not exists confirmed_at timestamptz;
