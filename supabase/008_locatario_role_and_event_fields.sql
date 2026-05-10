-- eMeet: endurecer rol locatario persistido y completar campos publicos de eventos

alter table public.profiles
  add column if not exists role text not null default 'user',
  add column if not exists business_name text,
  add column if not exists business_location text;

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'admin', 'locatario'));

update public.profiles p
set
  role = coalesce(nullif(u.raw_user_meta_data->>'role', ''), p.role, 'user'),
  business_name = coalesce(nullif(u.raw_user_meta_data->>'business_name', ''), p.business_name),
  business_location = coalesce(nullif(u.raw_user_meta_data->>'business_location', ''), p.business_location)
from auth.users u
where u.id = p.id;

alter table public.locatario_events
  add column if not exists video_url text,
  add column if not exists lat double precision,
  add column if not exists lng double precision;
