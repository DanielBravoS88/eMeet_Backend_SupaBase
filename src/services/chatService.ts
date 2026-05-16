import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Returns true when userId is an active member of roomId.
 * Uses count instead of select to avoid loading unnecessary data.
 */
export async function isMember(
  supabase: SupabaseClient,
  roomId: string,
  userId: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from('room_members')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', roomId)
    .eq('user_id', userId)

  if (error) return false
  return (count ?? 0) > 0
}

/**
 * Deletes the room and its content when no members remain.
 * Cascade handles messages and members automatically via FK constraints.
 */
export async function cleanupEmptyRoom(
  supabase: SupabaseClient,
  roomId: string,
): Promise<void> {
  const { count } = await supabase
    .from('room_members')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', roomId)

  if ((count ?? 0) === 0) {
    await supabase.from('chat_rooms').delete().eq('id', roomId)
  }
}

/**
 * Purges all chat rooms whose event_date is in the past.
 * Returns the IDs that were removed.
 */
export async function purgeExpiredRooms(supabase: SupabaseClient): Promise<string[]> {
  const { data } = await supabase
    .from('chat_rooms')
    .select('id')
    .not('event_date', 'is', null)
    .lt('event_date', new Date().toISOString())

  if (!data || data.length === 0) return []

  const expiredIds = data.map((r: { id: string }) => r.id)
  await supabase.from('chat_rooms').delete().in('id', expiredIds)
  return expiredIds
}
