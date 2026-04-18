-- eMeet: tabla de transacciones + columna status en locatario_events
-- Ejecutar en SQL Editor de Supabase después de 005_reports.sql

-- ─── Columna status en locatario_events ───────────────────────────────────────
-- Permite al panel admin distinguir eventos live / draft / flagged

alter table public.locatario_events
  add column if not exists status text not null default 'draft'
    check (status in ('live', 'draft', 'flagged'));

create index if not exists idx_locatario_events_status
  on public.locatario_events(status, created_at desc);

-- Política adicional: solo admins pueden cambiar el status de cualquier evento
create policy "locatario_events_update_status_admin"
  on public.locatario_events
  for update
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ─── Tabla transactions ───────────────────────────────────────────────────────

create table if not exists public.transactions (
  id          uuid        primary key default gen_random_uuid(),
  type        text        not null check (type in ('ticket', 'suscripcion', 'comision')),
  description text        not null default '',
  amount      numeric     not null,
  status      text        not null default 'pendiente'
                check (status in ('completado', 'pendiente', 'reembolsado')),
  event_id    uuid        references public.locatario_events(id) on delete set null,
  user_id     uuid        references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ─── Índices ──────────────────────────────────────────────────────────────────

create index if not exists idx_transactions_created_at
  on public.transactions(created_at desc);

create index if not exists idx_transactions_type_status
  on public.transactions(type, status);

create index if not exists idx_transactions_event_id
  on public.transactions(event_id);

create index if not exists idx_transactions_user_id
  on public.transactions(user_id);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table public.transactions enable row level security;

-- Cada usuario puede ver sus propias transacciones
create policy "transactions_select_own"
  on public.transactions
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Solo admins pueden ver todas las transacciones
create policy "transactions_select_admin"
  on public.transactions
  for select
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Solo el sistema (service_role) inserta transacciones, no usuarios directamente.
-- Se omite policy de insert para authenticated — se usa service_role desde el backend.
