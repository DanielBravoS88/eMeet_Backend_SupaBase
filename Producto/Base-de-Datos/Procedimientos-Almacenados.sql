-- Procedimientos almacenados y funciones PL/pgSQL — eMeet

-- 1. Trigger: crear perfil automáticamente al registrar usuario en auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Obtener cantidad de mensajes no leídos en una sala para un usuario
create or replace function public.get_room_unread_count(
  p_room_id text,
  p_user_id uuid
)
returns integer
language plpgsql
security definer
as $$
declare
  v_last_read timestamptz;
  v_count integer;
begin
  select last_read_at into v_last_read
  from public.room_members
  where room_id = p_room_id and user_id = p_user_id;

  if not found then
    return 0;
  end if;

  select count(*) into v_count
  from public.chat_messages
  where room_id = p_room_id
    and created_at > v_last_read
    and user_id != p_user_id;

  return coalesce(v_count, 0);
end;
$$;

-- 3. Obtener total de mensajes no leídos para un usuario en todas sus salas
create or replace function public.get_unread_count(p_user_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
  v_total integer := 0;
  v_room record;
begin
  for v_room in
    select room_id, last_read_at
    from public.room_members
    where user_id = p_user_id
  loop
    v_total := v_total + (
      select count(*)
      from public.chat_messages
      where room_id = v_room.room_id
        and created_at > v_room.last_read_at
        and user_id != p_user_id
    );
  end loop;
  return v_total;
end;
$$;

-- 4. Marcar sala como leída para un usuario
create or replace function public.mark_room_as_read(
  p_room_id text,
  p_user_id uuid
)
returns void
language plpgsql
security definer
as $$
begin
  update public.room_members
  set last_read_at = now()
  where room_id = p_room_id and user_id = p_user_id;
end;
$$;

-- 5. KPIs para panel de administración
create or replace function public.get_admin_kpis()
returns json
language plpgsql
security definer
as $$
declare
  v_users integer;
  v_messages integer;
  v_rooms integer;
  v_reports integer;
begin
  select count(*) into v_users from public.profiles;
  select count(*) into v_messages from public.chat_messages;
  select count(*) into v_rooms from public.chat_rooms;
  select count(*) into v_reports from public.reports where status = 'pending';

  return json_build_object(
    'total_users', v_users,
    'total_messages', v_messages,
    'total_rooms', v_rooms,
    'pending_reports', v_reports
  );
end;
$$;
