-- eMeet: persistencia real de rol y datos de locatario en profiles
-- Ejecutar despues de 001_emeet_schema.sql.

alter table public.profiles
  add column if not exists role text not null default 'user',
  add column if not exists business_name text,
  add column if not exists business_location text;

alter table public.profiles
  drop constraint if exists profiles_role_valid,
  add constraint profiles_role_valid check (role in ('user', 'locatario', 'admin'));

update public.profiles p
set
  role = case
    when u.raw_user_meta_data->>'role' in ('user', 'locatario', 'admin')
      then u.raw_user_meta_data->>'role'
    else p.role
  end,
  business_name = coalesce(p.business_name, nullif(u.raw_user_meta_data->>'business_name', '')),
  business_location = coalesce(p.business_location, nullif(u.raw_user_meta_data->>'business_location', ''))
from auth.users u
where u.id = p.id;

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
    bio,
    business_name,
    business_location
  )
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
  on conflict (id) do update
  set
    name = excluded.name,
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    role = excluded.role,
    bio = excluded.bio,
    business_name = excluded.business_name,
    business_location = excluded.business_location;

  return new;
end;
$$;
