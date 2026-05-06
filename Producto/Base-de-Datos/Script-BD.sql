-- =============================================================================
-- Script-BD.sql — eMeet Base de Datos (esquema completo consolidado)
-- Plataforma: Supabase (PostgreSQL)
--
-- INSTRUCCIONES:
-- 1. Abrir Supabase Dashboard → SQL Editor.
-- 2. Ejecutar este script completo.
-- O bien ejecutar los archivos individuales de supabase/ en orden numérico.
-- =============================================================================

-- Extensiones
create extension if not exists pgcrypto;

-- =============================================================================
-- TABLA: profiles
-- Perfil de usuario (ligado a auth.users de Supabase)
-- =============================================================================
create table if not exists public.profiles (
  id               uuid        primary key references auth.users(id) on delete cascade,
  name             text        not null,
  role             text        not null default 'user',
  bio              text        not null default '',
  avatar_url       text,
  location         text        not null default '',
  business_name    text,
  business_location text,
  interests        text[]      not null default '{}',
  created_at       timestamptz not null default now(),
  constraint profiles_role_valid check (role in ('user', 'locatario', 'admin')),
  constraint profiles_interests_valid check (
    interests <@ array[
      'gastronomia', 'musica', 'cultura', 'networking',
      'deporte', 'fiesta', 'teatro', 'arte'
    ]::text[]
  )
);

-- =============================================================================
-- TABLA: locatario_events
-- Eventos creados por usuarios con rol locatario
-- =============================================================================
create table if not exists public.locatario_events (
  id               uuid        primary key default gen_random_uuid(),
  creator_id       uuid        not null references public.profiles(id) on delete cascade,
  title            text        not null,
  description      text        not null default '',
  category         text        not null check (category in (
                                 'fiesta','musica','gastronomia','networking',
                                 'arte','cultura','teatro','deporte'
                               )),
  event_date       timestamptz not null,
  address          text        not null default '',
  price            numeric,
  image_url        text,
  video_url        text,
  organizer_name   text        not null default '',
  organizer_avatar text,
  lat              numeric,
  lng              numeric,
  status           text        not null default 'draft'
                               check (status in ('draft', 'live', 'flagged')),
  created_at       timestamptz not null default now()
);

-- =============================================================================
-- TABLA: user_events
-- Acciones de usuarios sobre eventos (like, save)
-- =============================================================================
create table if not exists public.user_events (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references public.profiles(id) on delete cascade,
  event_id        text        not null,
  event_title     text,
  event_image_url text,
  event_address   text,
  action          text        not null check (action in ('like', 'save')),
  created_at      timestamptz not null default now(),
  unique (user_id, event_id, action)
);

-- =============================================================================
-- TABLA: chat_rooms
-- Salas de chat vinculadas a eventos
-- =============================================================================
create table if not exists public.chat_rooms (
  id              text        primary key,
  event_title     text        not null,
  event_image_url text,
  event_address   text,
  created_at      timestamptz not null default now()
);

-- =============================================================================
-- TABLA: room_members
-- Participantes de cada sala de chat
-- =============================================================================
create table if not exists public.room_members (
  room_id      text        not null references public.chat_rooms(id) on delete cascade,
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  joined_at    timestamptz not null default now(),
  last_read_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

-- =============================================================================
-- TABLA: chat_messages
-- Mensajes dentro de salas de chat
-- =============================================================================
create table if not exists public.chat_messages (
  id         uuid        primary key default gen_random_uuid(),
  room_id    text        not null references public.chat_rooms(id) on delete cascade,
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  text       text        not null check (length(trim(text)) > 0),
  created_at timestamptz not null default now()
);

-- =============================================================================
-- TABLA: reports
-- Reportes de moderación sobre eventos, usuarios o comentarios
-- =============================================================================
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

-- =============================================================================
-- TABLA: transactions
-- Transacciones financieras (tickets, suscripciones, comisiones)
-- =============================================================================
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

-- =============================================================================
-- ÍNDICES
-- =============================================================================
create index if not exists idx_profiles_created_at
  on public.profiles(created_at desc);

create index if not exists idx_locatario_events_creator
  on public.locatario_events(creator_id, created_at desc);
create index if not exists idx_locatario_events_date
  on public.locatario_events(event_date desc);
create index if not exists idx_locatario_events_status
  on public.locatario_events(status, created_at desc);

create index if not exists idx_user_events_user_action_created
  on public.user_events(user_id, action, created_at desc);
create index if not exists idx_user_events_event_id
  on public.user_events(event_id);

create index if not exists idx_chat_rooms_created_at
  on public.chat_rooms(created_at desc);

create index if not exists idx_room_members_user_id
  on public.room_members(user_id);
create index if not exists idx_room_members_room_id
  on public.room_members(room_id);

create index if not exists idx_chat_messages_room_created
  on public.chat_messages(room_id, created_at desc);
create index if not exists idx_chat_messages_user_id
  on public.chat_messages(user_id);

create index if not exists idx_reports_status_created
  on public.reports(status, created_at desc);
create index if not exists idx_reports_reporter_id
  on public.reports(reporter_id);
create index if not exists idx_reports_target
  on public.reports(target_type, target_id);

create index if not exists idx_transactions_created_at
  on public.transactions(created_at desc);
create index if not exists idx_transactions_type_status
  on public.transactions(type, status);
create index if not exists idx_transactions_event_id
  on public.transactions(event_id);
create index if not exists idx_transactions_user_id
  on public.transactions(user_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
alter table public.profiles          enable row level security;
alter table public.locatario_events  enable row level security;
alter table public.user_events       enable row level security;
alter table public.chat_rooms        enable row level security;
alter table public.room_members      enable row level security;
alter table public.chat_messages     enable row level security;
alter table public.reports           enable row level security;
alter table public.transactions      enable row level security;

-- profiles
create policy "profiles_select_own"   on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles_insert_own"   on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own"   on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- locatario_events
create policy "locatario_events_select_all"  on public.locatario_events for select to authenticated using (true);
create policy "locatario_events_insert_own"  on public.locatario_events for insert to authenticated with check (auth.uid() = creator_id);
create policy "locatario_events_update_own"  on public.locatario_events for update to authenticated using (auth.uid() = creator_id) with check (auth.uid() = creator_id);
create policy "locatario_events_delete_own"  on public.locatario_events for delete to authenticated using (auth.uid() = creator_id);

-- user_events
create policy "user_events_select_own"  on public.user_events for select to authenticated using (auth.uid() = user_id);
create policy "user_events_insert_own"  on public.user_events for insert to authenticated with check (auth.uid() = user_id);
create policy "user_events_update_own"  on public.user_events for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_events_delete_own"  on public.user_events for delete to authenticated using (auth.uid() = user_id);

-- chat_rooms
create policy "chat_rooms_select_member"        on public.chat_rooms for select to authenticated
  using (exists (select 1 from public.room_members rm where rm.room_id = chat_rooms.id and rm.user_id = auth.uid()));
create policy "chat_rooms_insert_authenticated" on public.chat_rooms for insert to authenticated with check (true);

-- room_members
create policy "room_members_select_member"       on public.room_members for select to authenticated
  using (exists (select 1 from public.room_members rm2 where rm2.room_id = room_members.room_id and rm2.user_id = auth.uid()));
create policy "room_members_insert_authenticated" on public.room_members for insert to authenticated with check (auth.uid() = user_id);
create policy "room_members_update_own"           on public.room_members for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "room_members_delete_own"           on public.room_members for delete to authenticated using (auth.uid() = user_id);

-- chat_messages
create policy "chat_messages_select_member"        on public.chat_messages for select to authenticated
  using (exists (select 1 from public.room_members rm where rm.room_id = chat_messages.room_id and rm.user_id = auth.uid()));
create policy "chat_messages_insert_authenticated" on public.chat_messages for insert to authenticated
  with check (auth.uid() = user_id and exists (select 1 from public.room_members rm where rm.room_id = chat_messages.room_id and rm.user_id = auth.uid()));

-- =============================================================================
-- TRIGGER: auto-crear perfil al registrar usuario en Supabase Auth
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_url, role, bio, business_name, business_location)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    case
      when new.raw_user_meta_data->>'role' in ('user', 'locatario', 'admin')
        then new.raw_user_meta_data->>'role'
      else 'user'
    end,
    coalesce(new.raw_user_meta_data->>'bio', ''),
    nullif(new.raw_user_meta_data->>'business_name', ''),
    nullif(new.raw_user_meta_data->>'business_location', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- REALTIME
-- =============================================================================
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.room_members;

-- =============================================================================
-- STORAGE: bucket de avatares
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

create policy "avatars_public_read"       on storage.objects for select to public    using (bucket_id = 'avatars');
create policy "avatars_upload_own_folder" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_update_own_folder" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_delete_own_folder" on storage.objects for delete to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
