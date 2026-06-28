-- Ajustes exclusivos del esquema efimero DAST.

alter table public.profiles
  drop constraint if exists profiles_role_check;

insert into storage.buckets (id, name, public)
values
  ('event-images', 'event-images', true),
  ('event-videos', 'event-videos', true)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public;
