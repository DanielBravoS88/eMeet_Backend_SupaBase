import { Router } from 'express'
import { createServiceRoleClient } from '../lib/supabase'
import { withAuth } from '../middleware/auth'
import { badRequest, forbidden, serverError } from '../utils/http'
import { isMember, cleanupEmptyRoom, purgeExpiredRooms } from '../services/chatService'

const router = Router()
const serviceSupabase = createServiceRoleClient()

router.use(withAuth)

// ── GET /chat/rooms ───────────────────────────────────────────────────────────
// Returns all rooms the authenticated user belongs to.
// Lazily purges expired rooms (event_date < now) before responding.
router.get('/rooms', async (req, res) => {
  const { data: memberships, error: memberError } = await serviceSupabase
    .from('room_members')
    .select('room_id, last_read_at')
    .eq('user_id', req.authUser!.id)

  if (memberError) {
    return serverError(res, 'No se pudieron cargar las membresías de chat.')
  }

  let roomIds = memberships.map((m) => m.room_id)
  if (roomIds.length === 0) {
    return res.json([])
  }

  // Lazy expiry: delete rooms whose event_date passed, then exclude them
  const expiredIds = await purgeExpiredRooms(serviceSupabase)
  if (expiredIds.length > 0) {
    roomIds = roomIds.filter((id) => !expiredIds.includes(id))
  }

  if (roomIds.length === 0) {
    return res.json([])
  }

  const [
    { data: rooms, error: roomError },
    { data: messages, error: messageError },
    { data: allMemberships, error: membershipCountError },
  ] = await Promise.all([
    serviceSupabase.from('chat_rooms').select('*').in('id', roomIds),
    serviceSupabase
      .from('chat_messages')
      .select('id, room_id, user_id, text, created_at')
      .in('room_id', roomIds)
      .order('created_at', { ascending: false })
      .limit(200),
    serviceSupabase.from('room_members').select('room_id').in('room_id', roomIds),
  ])

  if (roomError || messageError || membershipCountError) {
    return serverError(res, 'No se pudieron cargar las salas de chat.')
  }

  const memberCountMap = roomIds.reduce<Record<string, number>>((acc, roomId) => {
    acc[roomId] = (allMemberships ?? []).filter((m) => m.room_id === roomId).length
    return acc
  }, {})

  const lastMessageByRoom = new Map<string, (typeof messages)[number]>()
  ;(messages ?? []).forEach((msg) => {
    if (!lastMessageByRoom.has(msg.room_id)) {
      lastMessageByRoom.set(msg.room_id, msg)
    }
  })

  const lastMessageSenderIds = Array.from(
    new Set(
      Array.from(lastMessageByRoom.values())
        .map((msg) => msg.user_id)
        .filter((value): value is string => Boolean(value)),
    ),
  )

  let lastMessageProfileMap = new Map<string, { id: string; name: string; avatar_url: string | null }>()
  if (lastMessageSenderIds.length > 0) {
    const { data: profiles, error: profilesError } = await serviceSupabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', lastMessageSenderIds)

    if (profilesError) {
      return serverError(res, 'No se pudieron cargar los perfiles del chat.')
    }

    lastMessageProfileMap = new Map(profiles.map((profile) => [profile.id, profile]))
  }

  const result = (rooms ?? []).map((room) => {
    const lastReadAt = memberships.find((m) => m.room_id === room.id)?.last_read_at
    const lastMessageRow = lastMessageByRoom.get(room.id) ?? null
    const lastMessageSender = lastMessageRow
      ? lastMessageProfileMap.get(lastMessageRow.user_id)
      : null
    const unreadCount = (messages ?? []).filter(
      (msg) =>
        msg.room_id === room.id &&
        msg.created_at > (lastReadAt ?? '') &&
        msg.user_id !== req.authUser!.id,
    ).length

    return {
      id: room.id,
      eventTitle: room.event_title,
      eventImageUrl: room.event_image_url ?? '',
      eventAddress: room.event_address ?? '',
      memberCount: memberCountMap[room.id] ?? 1,
      lastMessage: lastMessageRow
        ? {
            id: lastMessageRow.id,
            roomId: lastMessageRow.room_id,
            senderId: lastMessageRow.user_id,
            senderName: lastMessageSender?.name ?? 'Usuario',
            senderAvatar: lastMessageSender?.avatar_url ?? '',
            text: lastMessageRow.text,
            timestamp: lastMessageRow.created_at,
          }
        : null,
      unreadCount,
    }
  })

  return res.json(result)
})

// ── POST /chat/rooms/:id/join ────────────────────────────────────────────────
// Idempotent join: creates the room if absent, then upserts membership.
// Kept for scenarios where a user wants to rejoin or the like flow skipped chat.
router.post('/rooms/:id/join', async (req, res) => {
  const { id } = req.params
  const { eventTitle, eventImageUrl, eventAddress, eventDate } = req.body as {
    eventTitle?: string
    eventImageUrl?: string
    eventAddress?: string
    eventDate?: string
  }

  if (!eventTitle) {
    return badRequest(res, 'eventTitle es obligatorio para crear/unir sala.')
  }

  const { error: roomError } = await serviceSupabase
    .from('chat_rooms')
    .upsert(
      {
        id,
        event_title: eventTitle,
        event_image_url: eventImageUrl ?? null,
        event_address: eventAddress ?? null,
        event_date: eventDate ?? null,
      },
      { onConflict: 'id' },
    )

  if (roomError) {
    return serverError(res, 'No se pudo crear la sala.')
  }

  const { error: memberError } = await serviceSupabase
    .from('room_members')
    .upsert(
      { room_id: id, user_id: req.authUser!.id },
      { onConflict: 'room_id,user_id' },
    )

  if (memberError) {
    return serverError(res, 'No se pudo unir al chat.')
  }

  return res.status(201).json({ ok: true })
})

// ── GET /chat/rooms/:id/messages ─────────────────────────────────────────────
// Requires membership.
router.get('/rooms/:id/messages', async (req, res) => {
  const { id } = req.params

  const member = await isMember(serviceSupabase, id, req.authUser!.id)
  if (!member) {
    return forbidden(res, 'No eres miembro de esta sala.')
  }

  const { data, error } = await serviceSupabase
    .from('chat_messages')
    .select('id, room_id, user_id, text, created_at')
    .eq('room_id', id)
    .order('created_at', { ascending: true })

  if (error) {
    return serverError(res, 'No se pudieron obtener los mensajes.')
  }

  const senderIds = Array.from(new Set(data.map((row) => row.user_id)))
  let profileMap = new Map<string, { id: string; name: string; avatar_url: string | null }>()

  if (senderIds.length > 0) {
    const { data: profiles, error: profileError } = await serviceSupabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', senderIds)

    if (profileError) {
      return serverError(res, 'No se pudieron cargar los perfiles de chat.')
    }

    profileMap = new Map(profiles.map((p) => [p.id, p]))
  }

  const messages = data.map((row) => {
    const sender = profileMap.get(row.user_id)
    return {
      id: row.id,
      roomId: row.room_id,
      senderId: row.user_id,
      senderName: sender?.name ?? 'Usuario',
      senderAvatar: sender?.avatar_url ?? '',
      text: row.text,
      timestamp: row.created_at,
    }
  })

  return res.json(messages)
})

// ── POST /chat/rooms/:id/messages ────────────────────────────────────────────
// Requires membership.
router.post('/rooms/:id/messages', async (req, res) => {
  const { id } = req.params
  const { text } = req.body as { text?: string }

  if (!text || !text.trim()) {
    return badRequest(res, 'El mensaje no puede estar vacío.')
  }

  const member = await isMember(serviceSupabase, id, req.authUser!.id)
  if (!member) {
    return forbidden(res, 'No eres miembro de esta sala.')
  }

  const { data, error } = await serviceSupabase
    .from('chat_messages')
    .insert({
      room_id: id,
      user_id: req.authUser!.id,
      text: text.trim(),
    })
    .select('*')
    .single()

  if (error) {
    return serverError(res, 'No se pudo enviar el mensaje.')
  }

  return res.status(201).json(data)
})

// ── POST /chat/rooms/:id/read ─────────────────────────────────────────────────
// Marks last_read_at for the current user in the room.
// Silently succeeds even if the user is not a member (idempotent read marker).
router.post('/rooms/:id/read', async (req, res) => {
  const { id } = req.params

  const { error } = await serviceSupabase
    .from('room_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('room_id', id)
    .eq('user_id', req.authUser!.id)

  if (error) {
    return serverError(res, 'No se pudo actualizar el estado de lectura.')
  }

  return res.status(204).send()
})

// ── GET /chat/rooms/:id/unread ────────────────────────────────────────────────
router.get('/rooms/:id/unread', async (req, res) => {
  const { id } = req.params

  const { data: membership, error: memberError } = await serviceSupabase
    .from('room_members')
    .select('last_read_at')
    .eq('room_id', id)
    .eq('user_id', req.authUser!.id)
    .maybeSingle()

  if (memberError) {
    return serverError(res, 'No se pudo obtener estado de lectura.')
  }

  if (!membership) {
    return forbidden(res, 'No eres miembro de esta sala.')
  }

  const { data: unreadMessages, error: unreadError } = await serviceSupabase
    .from('chat_messages')
    .select('id')
    .eq('room_id', id)
    .gt('created_at', membership.last_read_at)
    .neq('user_id', req.authUser!.id)

  if (unreadError) {
    return serverError(res, 'No se pudo calcular mensajes no leídos.')
  }

  return res.json({ roomId: id, unread: (unreadMessages ?? []).length })
})

// ── GET /chat/unread ──────────────────────────────────────────────────────────
router.get('/unread', async (req, res) => {
  const { data: memberships, error: membershipError } = await serviceSupabase
    .from('room_members')
    .select('room_id, last_read_at')
    .eq('user_id', req.authUser!.id)

  if (membershipError) {
    return serverError(res, 'No se pudo obtener membresías para no leídos.')
  }

  const roomIds = memberships.map((m) => m.room_id)
  if (roomIds.length === 0) {
    return res.json([])
  }

  const { data: messages, error: messagesError } = await serviceSupabase
    .from('chat_messages')
    .select('id, room_id, user_id, created_at')
    .in('room_id', roomIds)
    .neq('user_id', req.authUser!.id)

  if (messagesError) {
    return serverError(res, 'No se pudieron calcular no leídos.')
  }

  const unreadByRoom = roomIds.reduce<Record<string, number>>((acc, roomId) => {
    const lastRead = memberships.find((m) => m.room_id === roomId)?.last_read_at ?? ''
    acc[roomId] = (messages ?? []).filter(
      (msg) => msg.room_id === roomId && msg.created_at > lastRead,
    ).length
    return acc
  }, {})

  return res.json(
    Object.entries(unreadByRoom).map(([roomId, unread]) => ({ roomId, unread })),
  )
})

// ── DELETE /chat/rooms/:id/leave ──────────────────────────────────────────────
// Removes the user from the room. Deletes room if no members remain.
router.delete('/rooms/:id/leave', async (req, res) => {
  const { id } = req.params

  const member = await isMember(serviceSupabase, id, req.authUser!.id)
  if (!member) {
    // Idempotent: already not a member
    return res.status(204).send()
  }

  const { error } = await serviceSupabase
    .from('room_members')
    .delete()
    .eq('room_id', id)
    .eq('user_id', req.authUser!.id)

  if (error) {
    return serverError(res, 'No se pudo salir del chat.')
  }

  await cleanupEmptyRoom(serviceSupabase, id)

  return res.status(204).send()
})

export default router
