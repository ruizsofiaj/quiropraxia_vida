-- Tablas de la DEMO (consultorio ficticio). Mismas tablas que el sistema real, con prefijo demo_.
-- Ejecutar una vez en el editor SQL de Supabase. No toca las tablas reales.

create extension if not exists btree_gist;

create table demo_services (
  id text primary key,
  name text not null,
  description text not null default '',
  duration_min int not null check (duration_min between 10 and 240),
  price_label text not null default 'A confirmar'
);

create table demo_settings (
  id int primary key default 1 check (id = 1),
  weekly jsonb not null,            -- 7 días: { open, ranges: [{start, end}] }, 0 = domingo
  buffer_min int not null default 10,
  min_notice_hours int not null default 3,
  max_days int not null default 30,
  cancel_limit_hours int not null default 12,
  step_min int not null default 30
);

create table demo_blocks (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text not null default 'Bloqueado',
  check (end_at > start_at)
);

create table demo_appointments (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  service_id text not null references demo_services(id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  name text not null,
  phone text not null,
  email text,
  reason text,                      -- dato de salud: solo visible para Hugo
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  source text not null default 'web' check (source in ('web', 'manual')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,         -- cuándo Hugo confirmó por WhatsApp
  reminder_sent_at timestamptz,     -- cuándo Hugo mandó el recordatorio
  -- Evita que dos turnos confirmados se pisen, aunque lleguen a la vez.
  constraint no_overlap exclude using gist (
    tstzrange(start_at, end_at) with &&
  ) where (status = 'confirmed')
);

-- Seguridad: nadie lee estas tablas desde el navegador. Todo pasa por el servidor con la service key.
alter table demo_services enable row level security;
alter table demo_settings enable row level security;
alter table demo_blocks enable row level security;
alter table demo_appointments enable row level security;

-- Permisos para el servidor (service_role) sobre las tablas nuevas.
-- Sin esto la API responde "permission denied for table ...".
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;

