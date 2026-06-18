-- Rulează în Supabase: SQL Editor → New query → Run

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time text not null,
  service_id text not null,
  duration_minutes integer not null,
  balayage_options jsonb,
  client_name text not null,
  client_phone text not null,
  client_email text default '',
  created_at timestamptz not null default now()
);

create index if not exists bookings_date_idx on bookings (date);
create index if not exists bookings_created_at_idx on bookings (created_at desc);

create table if not exists blocked_days (
  date date primary key,
  reason text,
  created_at timestamptz not null default now()
);

alter table bookings enable row level security;
alter table blocked_days enable row level security;

-- Acces doar prin service role key (server-side), nu anon key
create policy "Service role full access bookings"
  on bookings for all
  using (false)
  with check (false);

create policy "Service role full access blocked_days"
  on blocked_days for all
  using (false)
  with check (false);
