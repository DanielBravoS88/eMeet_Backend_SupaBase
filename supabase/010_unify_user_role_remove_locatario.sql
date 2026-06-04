-- eMeet: unificacion de rol — elimina 'locatario' y agrega flag is_event_creator
-- Ejecutar despues de 008_profiles_role_business_fields.sql
--
-- CAMBIO DE MODELO:
--   Antes: role IN ('user', 'locatario', 'admin')
--   Ahora: role IN ('user', 'admin')  +  is_event_creator BOOLEAN
--
-- La capacidad de crear eventos pasa de ser un rol a ser una flag activable
-- desde el perfil. Cualquier usuario puede convertirse en creador.

-- 1) Nueva columna is_event_creator
alter table public.profiles
  add column if not exists is_event_creator boolean not null default false;

-- 2) Backfill: todos los locatarios existentes pasan a user + is_event_creator=true
update public.profiles
set
  is_event_creator = true
where role = 'locatario';

update public.profiles
set
  role = 'user'
where role = 'locatario';

-- 3) Actualizar constraint: ya no se permite 'locatario'
alter table public.profiles
  drop constraint if exists profiles_role_valid;

alter table public.profiles
  add constraint profiles_role_valid check (role in ('user', 'admin'));

-- 4) Sincronizar raw_user_meta_data en auth.users — para que el JWT refleje el nuevo modelo
update auth.users
set raw_user_meta_data =
  coalesce(raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object('is_event_creator', true)
  || jsonb_build_object('role', 'user')
where raw_user_meta_data->>'role' = 'locatario';

-- 5) Actualizar trigger handle_new_user: nunca crea cuentas con rol locatario;
--    si raw_user_meta_data trae is_event_creator, se respeta.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    name,
    avatar_url,
    role,
    is_event_creator,
    bio,
    business_name,
    business_location
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    case
      -- legacy: cuentas viejas con role=locatario se promueven a user+creator
      when new.raw_user_meta_data->>'role' = 'locatario' then 'user'
      when new.raw_user_meta_data->>'role' in ('user', 'admin')
        then new.raw_user_meta_data->>'role'
      else 'user'
    end,
    -- flag explícito o derivado de role legacy
    coalesce(
      (new.raw_user_meta_data->>'is_event_creator')::boolean,
      new.raw_user_meta_data->>'role' = 'locatario',
      false
    ),
    coalesce(new.raw_user_meta_data->>'bio', ''),
    nullif(new.raw_user_meta_data->>'business_name', ''),
    nullif(new.raw_user_meta_data->>'business_location', '')
  )
  on conflict (id) do update
  set
    name = excluded.name,
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    role = excluded.role,
    is_event_creator = excluded.is_event_creator,
    bio = excluded.bio,
    business_name = excluded.business_name,
    business_location = excluded.business_location;

  return new;
end;
$$;

-- 6) Indice util para consultas que filtran por creadores
create index if not exists profiles_is_event_creator_idx
  on public.profiles (is_event_creator)
  where is_event_creator = true;

-- ROLLBACK MANUAL (solo en caso de necesitar revertir):
--   alter table public.profiles drop constraint profiles_role_valid;
--   alter table public.profiles add constraint profiles_role_valid
--     check (role in ('user', 'locatario', 'admin'));
--   update public.profiles set role = 'locatario' where is_event_creator = true;
--   alter table public.profiles drop column is_event_creator;
