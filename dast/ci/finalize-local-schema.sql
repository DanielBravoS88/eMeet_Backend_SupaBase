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

-- Las tablas creadas desde los SQL historicos no heredan automaticamente
-- privilegios para service_role en el Supabase efimero de GitHub Actions.
-- Se limita el acceso a las tablas consultadas por la matriz DAST GET.
grant usage on schema public to service_role;

grant select on table
  public.profiles,
  public.user_events,
  public.chat_rooms,
  public.room_members,
  public.chat_messages,
  public.locatario_events,
  public.reports,
  public.transactions,
  public.promotion_campaigns,
  public.coupons
to service_role;

-- withAuth sincroniza el perfil autenticado mediante upsert.
grant insert, update on table public.profiles to service_role;
