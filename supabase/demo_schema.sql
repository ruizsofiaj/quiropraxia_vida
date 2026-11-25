-- Tablas de la DEMO: un juego de tablas por rubro (demo_consultorio_, demo_peluqueria_, ...).
-- Ejecutar una vez en el editor SQL de Supabase. No toca las tablas reales ni las de la demo anterior.

create extension if not exists btree_gist;

-- Rubro: consultorio

create table if not exists demo_consultorio_services (
  id text primary key,
  name text not null,
  description text not null default '',
  duration_min int not null check (duration_min between 10 and 240),
  price_label text not null default 'A confirmar'
);

create table if not exists demo_consultorio_settings (
  id int primary key default 1 check (id = 1),
  weekly jsonb not null,
  buffer_min int not null default 10,
  min_notice_hours int not null default 3,
  max_days int not null default 30,
  cancel_limit_hours int not null default 12,
  step_min int not null default 30
);

create table if not exists demo_consultorio_blocks (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text not null default 'Bloqueado',
  check (end_at > start_at)
);

create table if not exists demo_consultorio_appointments (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  service_id text not null references demo_consultorio_services(id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  name text not null,
  phone text not null,
  email text,
  reason text,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  source text not null default 'web' check (source in ('web', 'manual')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  reminder_sent_at timestamptz,
  constraint demo_consultorio_no_overlap exclude using gist (
    tstzrange(start_at, end_at) with &&
  ) where (status = 'confirmed')
);

alter table demo_consultorio_services enable row level security;
alter table demo_consultorio_settings enable row level security;
alter table demo_consultorio_blocks enable row level security;
alter table demo_consultorio_appointments enable row level security;

-- Rubro: peluqueria

create table if not exists demo_peluqueria_services (
  id text primary key,
  name text not null,
  description text not null default '',
  duration_min int not null check (duration_min between 10 and 240),
  price_label text not null default 'A confirmar'
);

create table if not exists demo_peluqueria_settings (
  id int primary key default 1 check (id = 1),
  weekly jsonb not null,
  buffer_min int not null default 10,
  min_notice_hours int not null default 3,
  max_days int not null default 30,
  cancel_limit_hours int not null default 12,
  step_min int not null default 30
);

create table if not exists demo_peluqueria_blocks (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text not null default 'Bloqueado',
  check (end_at > start_at)
);

create table if not exists demo_peluqueria_appointments (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  service_id text not null references demo_peluqueria_services(id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  name text not null,
  phone text not null,
  email text,
  reason text,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  source text not null default 'web' check (source in ('web', 'manual')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  reminder_sent_at timestamptz,
  constraint demo_peluqueria_no_overlap exclude using gist (
    tstzrange(start_at, end_at) with &&
  ) where (status = 'confirmed')
);

alter table demo_peluqueria_services enable row level security;
alter table demo_peluqueria_settings enable row level security;
alter table demo_peluqueria_blocks enable row level security;
alter table demo_peluqueria_appointments enable row level security;

-- Rubro: estetica

create table if not exists demo_estetica_services (
  id text primary key,
  name text not null,
  description text not null default '',
  duration_min int not null check (duration_min between 10 and 240),
  price_label text not null default 'A confirmar'
);

create table if not exists demo_estetica_settings (
  id int primary key default 1 check (id = 1),
  weekly jsonb not null,
  buffer_min int not null default 10,
  min_notice_hours int not null default 3,
  max_days int not null default 30,
  cancel_limit_hours int not null default 12,
  step_min int not null default 30
);

create table if not exists demo_estetica_blocks (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text not null default 'Bloqueado',
  check (end_at > start_at)
);

create table if not exists demo_estetica_appointments (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  service_id text not null references demo_estetica_services(id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  name text not null,
  phone text not null,
  email text,
  reason text,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  source text not null default 'web' check (source in ('web', 'manual')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  reminder_sent_at timestamptz,
  constraint demo_estetica_no_overlap exclude using gist (
    tstzrange(start_at, end_at) with &&
  ) where (status = 'confirmed')
);

alter table demo_estetica_services enable row level security;
alter table demo_estetica_settings enable row level security;
alter table demo_estetica_blocks enable row level security;
alter table demo_estetica_appointments enable row level security;

-- Rubro: taller

create table if not exists demo_taller_services (
  id text primary key,
  name text not null,
  description text not null default '',
  duration_min int not null check (duration_min between 10 and 240),
  price_label text not null default 'A confirmar'
);

create table if not exists demo_taller_settings (
  id int primary key default 1 check (id = 1),
  weekly jsonb not null,
  buffer_min int not null default 10,
  min_notice_hours int not null default 3,
  max_days int not null default 30,
  cancel_limit_hours int not null default 12,
  step_min int not null default 30
);

create table if not exists demo_taller_blocks (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text not null default 'Bloqueado',
  check (end_at > start_at)
);

create table if not exists demo_taller_appointments (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  service_id text not null references demo_taller_services(id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  name text not null,
  phone text not null,
  email text,
  reason text,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  source text not null default 'web' check (source in ('web', 'manual')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  reminder_sent_at timestamptz,
  constraint demo_taller_no_overlap exclude using gist (
    tstzrange(start_at, end_at) with &&
  ) where (status = 'confirmed')
);

alter table demo_taller_services enable row level security;
alter table demo_taller_settings enable row level security;
alter table demo_taller_blocks enable row level security;
alter table demo_taller_appointments enable row level security;

-- Rubro: estudio

create table if not exists demo_estudio_services (
  id text primary key,
  name text not null,
  description text not null default '',
  duration_min int not null check (duration_min between 10 and 240),
  price_label text not null default 'A confirmar'
);

create table if not exists demo_estudio_settings (
  id int primary key default 1 check (id = 1),
  weekly jsonb not null,
  buffer_min int not null default 10,
  min_notice_hours int not null default 3,
  max_days int not null default 30,
  cancel_limit_hours int not null default 12,
  step_min int not null default 30
);

create table if not exists demo_estudio_blocks (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text not null default 'Bloqueado',
  check (end_at > start_at)
);

create table if not exists demo_estudio_appointments (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  service_id text not null references demo_estudio_services(id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  name text not null,
  phone text not null,
  email text,
  reason text,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  source text not null default 'web' check (source in ('web', 'manual')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  reminder_sent_at timestamptz,
  constraint demo_estudio_no_overlap exclude using gist (
    tstzrange(start_at, end_at) with &&
  ) where (status = 'confirmed')
);

alter table demo_estudio_services enable row level security;
alter table demo_estudio_settings enable row level security;
alter table demo_estudio_blocks enable row level security;
alter table demo_estudio_appointments enable row level security;

-- Permisos del servidor (service_role) sobre las tablas nuevas.
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;

-- Opcional: borrar las tablas de la demo anterior (un solo consultorio), que ya no se usan.
-- drop table if exists demo_appointments, demo_blocks, demo_settings, demo_services;
