-- eMeet: tabla de reportes para el sistema de moderación
-- Ejecutar en SQL Editor de Supabase después de 004_fix_policies.sql

-- ─── Tabla ────────────────────────────────────────────────────────────────────

create table if not exists public.reports (
  id          uuid        primary key default gen_random_uuid(),
  type        text        not null check (type in ('spam', 'inappropriate', 'fake', 'other')),
  description text        not null default '',
  target_type text        not null check (target_type in ('event', 'user', 'comment')),
  target_id   text        not null,
  reporter_id uuid        not null references public.profiles(id) on delete cascade,
  status      text        not null default 'pending'
                check (status in ('pending', 'resolved', 'dismissed')),
  resolved_by uuid        references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at  timestamptz not null default now()
);

-- ─── Índices ──────────────────────────────────────────────────────────────────

create index if not exists idx_reports_status_created
  on public.reports(status, created_at desc);

create index if not exists idx_reports_reporter_id
  on public.reports(reporter_id);

create index if not exists idx_reports_target
  on public.reports(target_type, target_id);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table public.reports enable row level security;

-- Cualquier usuario autenticado puede crear un reporte
create policy "reports_insert_authenticated"
  on public.reports
  for insert
  to authenticated
  with check (auth.uid() = reporter_id);

-- Cada usuario solo puede ver sus propios reportes
create policy "reports_select_own"
  on public.reports
  for select
  to authenticated
  using (auth.uid() = reporter_id);

-- Solo admins pueden ver todos los reportes
create policy "reports_select_admin"
  on public.reports
  for select
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Solo admins pueden actualizar el estado de un reporte (resolver / descartar)
create policy "reports_update_admin"
  on public.reports
  for update
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
