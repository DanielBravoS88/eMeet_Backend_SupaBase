-- =============================================================================
-- Procedimientos-Almacenados.sql — eMeet
-- Funciones y procedimientos PL/pgSQL
--
-- INSTRUCCIONES:
-- Ejecutar en SQL Editor de Supabase después de Script-BD.sql.
-- =============================================================================

-- =============================================================================
-- FUNCIÓN: handle_new_user()
-- Se ejecuta automáticamente (trigger) cuando se registra un usuario en
-- auth.users de Supabase. Crea el perfil del usuario en public.profiles.
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

-- Trigger asociado
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- FUNCIÓN: get_unread_count(p_user_id uuid)
-- Retorna el total de mensajes no leídos del usuario en todas sus salas.
-- =============================================================================
create or replace function public.get_unread_count(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  select coalesce(sum(
    (
      select count(*)
      from public.chat_messages cm
      where cm.room_id = rm.room_id
        and cm.created_at > rm.last_read_at
        and cm.user_id <> p_user_id
    )
  ), 0)
  into v_count
  from public.room_members rm
  where rm.user_id = p_user_id;

  return v_count;
end;
$$;

-- =============================================================================
-- FUNCIÓN: get_room_unread_count(p_room_id text, p_user_id uuid)
-- Retorna el número de mensajes no leídos de un usuario en una sala específica.
-- =============================================================================
create or replace function public.get_room_unread_count(p_room_id text, p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last_read timestamptz;
  v_count     integer;
begin
  select last_read_at
  into v_last_read
  from public.room_members
  where room_id = p_room_id
    and user_id  = p_user_id;

  if not found then
    return 0;
  end if;

  select count(*)
  into v_count
  from public.chat_messages
  where room_id    = p_room_id
    and created_at > v_last_read
    and user_id   <> p_user_id;

  return coalesce(v_count, 0);
end;
$$;

-- =============================================================================
-- FUNCIÓN: mark_room_as_read(p_room_id text, p_user_id uuid)
-- Actualiza last_read_at del usuario en una sala al momento actual.
-- =============================================================================
create or replace function public.mark_room_as_read(p_room_id text, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.room_members
  set    last_read_at = now()
  where  room_id = p_room_id
    and  user_id  = p_user_id;
end;
$$;

-- =============================================================================
-- FUNCIÓN: get_admin_kpis()
-- Retorna KPIs de negocio para el panel de administración.
-- =============================================================================
create or replace function public.get_admin_kpis()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_gmv          numeric := 0;
  v_month_rev    numeric := 0;
  v_tickets_sold integer := 0;
  v_result       json;
begin
  select
    coalesce(sum(case when status = 'completado' then amount else 0 end), 0),
    coalesce(sum(case when status = 'completado'
                       and date_trunc('month', created_at) = date_trunc('month', now())
                      then amount else 0 end), 0),
    coalesce(sum(case when status = 'completado' and type = 'ticket' then 1 else 0 end), 0)
  into v_gmv, v_month_rev, v_tickets_sold
  from public.transactions;

  v_result := json_build_object(
    'gmv',          v_gmv,
    'monthRevenue', v_month_rev,
    'ticketsSold',  v_tickets_sold
  );

  return v_result;
end;
$$;
