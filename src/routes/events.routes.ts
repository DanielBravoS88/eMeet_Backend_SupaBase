import { Router } from 'express'
import { createServiceRoleClient } from '../lib/supabase'
import { requireEventCreator, withAuth } from '../middleware/auth'
import { badRequest, serverError } from '../utils/http'
import { cleanupEmptyRoom } from '../services/chatService'

const router = Router()
const serviceSupabase = createServiceRoleClient()

const EVENT_CATEGORIES = ['gastronomia', 'musica', 'cultura', 'networking', 'deporte', 'fiesta', 'teatro', 'arte'] as const

type EventCategory = (typeof EVENT_CATEGORIES)[number]

function isOneOf<T extends readonly string[]>(value: unknown, options: T): value is T[number] {
  return typeof value === 'string' && options.includes(value)
}

function parseOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  if (typeof value !== 'number' || Number.isNaN(value)) return Number.NaN
  return value
}

router.get('/locatario/public', async (_req, res) => {
  // Lazy purge: delete past events before responding
  await serviceSupabase
    .from('locatario_events')
    .delete()
    .not('event_date', 'is', null)
    .lt('event_date', new Date().toISOString())

  const { data, error } = await serviceSupabase
    .from('locatario_events')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return serverError(res, 'No se pudieron obtener los eventos publicos.')
  }

  return res.json(data ?? [])
})

router.use(withAuth)

router.post('/like', async (req, res) => {
  const { eventId, eventTitle, eventImageUrl, eventAddress, eventDate } = req.body as {
    eventId?: string
    eventTitle?: string
    eventImageUrl?: string
    eventAddress?: string
    eventDate?: string
  }

  if (!eventId || !eventTitle) {
    return badRequest(res, 'eventId y eventTitle son obligatorios.')
  }

  const { error: likeError } = await req.supabase!
    .from('user_events')
    .upsert(
      {
        user_id: req.authUser!.id,
        event_id: eventId,
        event_title: eventTitle,
        event_image_url: eventImageUrl ?? null,
        event_address: eventAddress ?? null,
        action: 'like',
        created_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,event_id,action' },
    )

  if (likeError) {
    console.error('[POST /events/like] user_events upsert error:', likeError.code, likeError.message, likeError.details)
    return serverError(res, 'No se pudo registrar el like.')
  }

  // Look up authoritative event_date and creator_id from locatario_events.
  // If not found (e.g. Google Places event), event_date stays null and no creator is added.
  let resolvedEventDate: string | null = eventDate ?? null
  let creatorId: string | null = null

  const { data: locatarioEvent } = await serviceSupabase
    .from('locatario_events')
    .select('creator_id, event_date')
    .eq('id', eventId)
    .maybeSingle()

  if (locatarioEvent) {
    resolvedEventDate = locatarioEvent.event_date
    creatorId = locatarioEvent.creator_id
  }

  const { error: roomError } = await serviceSupabase
    .from('chat_rooms')
    .upsert(
      {
        id: eventId,
        event_title: eventTitle,
        event_image_url: eventImageUrl ?? null,
        event_address: eventAddress ?? null,
        event_date: resolvedEventDate,
      },
      { onConflict: 'id' },
    )

  if (roomError) {
    return serverError(res, 'No se pudo crear la sala del evento.')
  }

  // Add the liking user as member
  const now = new Date().toISOString()
  const membersToUpsert: { room_id: string; user_id: string; joined_at: string; last_read_at: string }[] = [
    { room_id: eventId, user_id: req.authUser!.id, joined_at: now, last_read_at: now },
  ]

  // Also add the locatario creator so they always belong to their event chat
  if (creatorId && creatorId !== req.authUser!.id) {
    membersToUpsert.push({ room_id: eventId, user_id: creatorId, joined_at: now, last_read_at: now })
  }

  const { error: memberError } = await serviceSupabase
    .from('room_members')
    .upsert(membersToUpsert, { onConflict: 'room_id,user_id' })

  if (memberError) {
    return serverError(res, 'No se pudo unir al usuario a la sala del evento.')
  }

  return res.status(201).json({ ok: true })
})

router.post('/save', async (req, res) => {
  const { eventId, eventTitle, eventImageUrl, eventAddress } = req.body as {
    eventId?: string
    eventTitle?: string
    eventImageUrl?: string
    eventAddress?: string
  }

  if (!eventId || !eventTitle) {
    return badRequest(res, 'eventId y eventTitle son obligatorios.')
  }

  const { error } = await serviceSupabase
    .from('user_events')
    .upsert(
      {
        user_id: req.authUser!.id,
        event_id: eventId,
        event_title: eventTitle,
        event_image_url: eventImageUrl ?? null,
        event_address: eventAddress ?? null,
        action: 'save',
      },
      { onConflict: 'user_id,event_id,action' },
    )

  if (error) {
    return serverError(res, 'No se pudo guardar el evento.')
  }

  return res.status(201).json({ ok: true })
})

router.delete('/like/:id', async (req, res) => {
  const { id } = req.params

  const { error } = await serviceSupabase
    .from('user_events')
    .delete()
    .eq('user_id', req.authUser!.id)
    .eq('event_id', id)
    .eq('action', 'like')

  if (error) {
    return serverError(res, 'No se pudo eliminar el like.')
  }

  // Leave the event chat when unliking
  await serviceSupabase
    .from('room_members')
    .delete()
    .eq('room_id', id)
    .eq('user_id', req.authUser!.id)

  await cleanupEmptyRoom(serviceSupabase, id)

  return res.status(204).send()
})

router.delete('/save/:id', async (req, res) => {
  const { id } = req.params

  const { error } = await serviceSupabase
    .from('user_events')
    .delete()
    .eq('user_id', req.authUser!.id)
    .eq('event_id', id)
    .eq('action', 'save')

  if (error) {
    return serverError(res, 'No se pudo eliminar el guardado.')
  }

  return res.status(204).send()
})

router.get('/liked', async (req, res) => {
  const { data, error } = await serviceSupabase
    .from('user_events')
    .select('*')
    .eq('user_id', req.authUser!.id)
    .eq('action', 'like')
    .order('created_at', { ascending: false })

  if (error) {
    return serverError(res, 'No se pudieron obtener los likes.')
  }

  return res.json(data)
})

router.get('/saved', async (req, res) => {
  const { data, error } = await serviceSupabase
    .from('user_events')
    .select('*')
    .eq('user_id', req.authUser!.id)
    .eq('action', 'save')
    .order('created_at', { ascending: false })

  if (error) {
    return serverError(res, 'No se pudieron obtener los guardados.')
  }

  return res.json(data)
})

// Listar los eventos propios NO requiere modo creador: filtra por creator_id,
// así que un usuario sin eventos simplemente recibe []. Evita un 403 innecesario
// (que el navegador registra en consola) al cargar el feed.
router.get('/locatario', async (req, res) => {
  const { data, error } = await serviceSupabase
    .from('locatario_events')
    .select('*')
    .eq('creator_id', req.authUser!.id)
    .order('created_at', { ascending: false })

  if (error) {
    return serverError(res, 'No se pudieron obtener los eventos.')
  }

  return res.json(data ?? [])
})

/**
 * Estadísticas agregadas de los eventos del creador autenticado.
 *
 * Devuelve, para cada evento propio:
 *   • likes (cuántos usuarios dieron 'Voy' / me interesa)
 *   • chatMembers (cuántos están en el chat del evento)
 *
 * Más totales globales:
 *   • totalLikes — suma de likes en todos sus eventos
 *   • totalChatMembers — suma de miembros (descontando al propio creador)
 *   • topEventId — el evento con más likes (null si no hay)
 *
 * Implementación: dos queries livianas a user_events y room_members usando
 * el service role (las queries con count exact = 0 evitan traer filas).
 */
router.get('/locatario/stats', async (req, res) => {
  const creatorId = req.authUser!.id

  // 1) IDs de los eventos del creador.
  const { data: myEvents, error: eventsError } = await serviceSupabase
    .from('locatario_events')
    .select('id')
    .eq('creator_id', creatorId)

  if (eventsError) {
    return serverError(res, 'No se pudieron obtener los eventos del creador.')
  }

  const eventIds = (myEvents ?? []).map((e) => e.id as string)

  if (eventIds.length === 0) {
    return res.json({
      likesByEvent: {},
      chatMembersByEvent: {},
      totalLikes: 0,
      totalChatMembers: 0,
      topEventId: null,
    })
  }

  // 2) Likes recibidos por cada evento.
  const { data: likeRows, error: likesError } = await serviceSupabase
    .from('user_events')
    .select('event_id')
    .eq('action', 'like')
    .in('event_id', eventIds)

  if (likesError) {
    return serverError(res, 'No se pudieron contar los interesados.')
  }

  const likesByEvent: Record<string, number> = {}
  for (const row of likeRows ?? []) {
    const id = row.event_id as string
    likesByEvent[id] = (likesByEvent[id] ?? 0) + 1
  }

  // 3) Miembros de los chats (sin contar al creador, que se auto-une).
  const { data: memberRows, error: membersError } = await serviceSupabase
    .from('room_members')
    .select('room_id, user_id')
    .in('room_id', eventIds)

  if (membersError) {
    return serverError(res, 'No se pudieron contar los miembros de los chats.')
  }

  const chatMembersByEvent: Record<string, number> = {}
  for (const row of memberRows ?? []) {
    if (row.user_id === creatorId) continue
    const id = row.room_id as string
    chatMembersByEvent[id] = (chatMembersByEvent[id] ?? 0) + 1
  }

  const totalLikes = Object.values(likesByEvent).reduce((a, b) => a + b, 0)
  const totalChatMembers = Object.values(chatMembersByEvent).reduce((a, b) => a + b, 0)

  let topEventId: string | null = null
  let topLikes = 0
  for (const [id, count] of Object.entries(likesByEvent)) {
    if (count > topLikes) {
      topLikes = count
      topEventId = id
    }
  }

  return res.json({
    likesByEvent,
    chatMembersByEvent,
    totalLikes,
    totalChatMembers,
    topEventId,
  })
})

router.post('/locatario', requireEventCreator, async (req, res) => {
  const body = req.body as {
    title?: string
    description?: string
    category?: EventCategory
    event_date?: string
    address?: string
    price?: number | null
    image_url?: string | null
    video_url?: string | null
    audio_preview_url?: string | null
    audio_track_id?: string | null
    organizer_name?: string
    organizer_avatar?: string | null
    lat?: number | null
    lng?: number | null
  }

  if (!body.title?.trim() || !body.description?.trim() || !body.event_date || !body.category) {
    return badRequest(res, 'Titulo, descripcion, categoria y fecha son obligatorios.')
  }

  if (!isOneOf(body.category, EVENT_CATEGORIES)) {
    return badRequest(res, 'La categoria del evento no es valida.')
  }

  const eventDate = new Date(body.event_date)
  if (Number.isNaN(eventDate.getTime())) {
    return badRequest(res, 'La fecha del evento no es valida.')
  }

  const price = parseOptionalNumber(body.price)
  if (Number.isNaN(price)) {
    return badRequest(res, 'El precio del evento no es valido.')
  }

  const lat = parseOptionalNumber(body.lat)
  const lng = parseOptionalNumber(body.lng)

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return badRequest(res, 'Las coordenadas del evento no son validas.')
  }

  const { data, error } = await serviceSupabase
    .from('locatario_events')
    .insert({
      creator_id: req.authUser!.id,
      title: body.title.trim(),
      description: body.description.trim(),
      category: body.category,
      event_date: eventDate.toISOString(),
      address: body.address?.trim() ?? '',
      price,
      image_url: body.image_url?.trim() || null,
      video_url: body.video_url?.trim() || null,
      audio_preview_url: body.audio_preview_url?.trim() || null,
      audio_track_id: body.audio_track_id?.trim() || null,
      organizer_name: body.organizer_name ?? '',
      organizer_avatar: body.organizer_avatar ?? null,
      lat,
      lng,
      // Opcion A: publicar directo. La columna `status` defaultea a 'draft'
      // pero el feed publico no filtra por status, asi que dejarlo como draft
      // confunde. Hasta que exista un flujo de borradores en el panel del
      // creador, todo evento creado se publica inmediatamente.
      status: 'live',
    })
    .select('*')
    .single()

  if (error) {
    return serverError(res, 'No se pudo crear el evento.')
  }

  return res.status(201).json(data)
})

router.delete('/locatario/:id', requireEventCreator, async (req, res) => {
  const { id } = req.params

  const { error } = await serviceSupabase
    .from('locatario_events')
    .delete()
    .eq('id', id)
    .eq('creator_id', req.authUser!.id)

  if (error) {
    return serverError(res, 'No se pudo eliminar el evento.')
  }

  return res.status(204).send()
})

export default router
