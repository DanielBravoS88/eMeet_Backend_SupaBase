-- Migration 009: chat_rooms expiry + cleanup function
-- Run in Supabase SQL Editor

-- 1. Add event_date to chat_rooms for expiry-based cleanup
alter table public.chat_rooms
  add column if not exists event_date timestamptz;

-- 2. Index for fast expiry queries
create index if not exists idx_chat_rooms_event_date
  on public.chat_rooms(event_date)
  where event_date is not null;

-- 3. cleanup_expired_chat_rooms()
--    Deletes rooms whose event_date has passed.
--    Cascades: chat_messages and room_members are deleted automatically.
--    Returns the number of rooms deleted.
create or replace function public.cleanup_expired_chat_rooms()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  with deleted as (
    delete from public.chat_rooms
    where event_date is not null
      and event_date < now()
    returning id
  )
  select count(*) into deleted_count from deleted;

  return deleted_count;
end;
$$;

-- 4. Ensure chat_rooms is in the realtime publication
-- (already done in 001 for chat_messages; add chat_rooms here for room deletions)
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'chat_rooms'
  ) then
    alter publication supabase_realtime add table public.chat_rooms;
  end if;
end $$;
