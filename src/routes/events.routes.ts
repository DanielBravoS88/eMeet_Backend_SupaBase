import { Router } from 'express'
import { createServiceRoleClient } from '../lib/supabase'
import { requireRole, withAuth } from '../middleware/auth'
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

  const { error: likeError } = await serviceSupabase
    .from('user_events')
    .upsert(
      {
        user_id: req.authUser!.id,
        event_id: eventId,
        event_title: eventTitle,
        event_image_url: eventImageUrl ?? null,
        event_address: eventAddress ?? null,
        action: 'like',
      },
      { onConflict: 'user_id,event_id,action' },
    )

  if (likeError) {
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
  const membersToUpsert: { room_id: string; user_id: string }[] = [
    { room_id: eventId, user_id: req.authUser!.id },
  ]

  // Also add the locatario creator so they always belong to their event chat
  if (creatorId && creatorId !== req.authUser!.id) {
    membersToUpsert.push({ room_id: eventId, user_id: creatorId })
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

router.get('/locatario', requireRole('locatario'), async (req, res) => {
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

router.post('/locatario', requireRole('locatario'), async (req, res) => {
  const body = req.body as {
    title?: string
    description?: string
    category?: EventCategory
    event_date?: string
    address?: string
    price?: number | null
    image_url?: string | null
    video_url?: string | null
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
      organizer_name: body.organizer_name ?? '',
      organizer_avatar: body.organizer_avatar ?? null,
      lat,
      lng,
    })
    .select('*')
    .single()

  if (error) {
    return serverError(res, 'No se pudo crear el evento.')
  }

  return res.status(201).json(data)
})

router.delete('/locatario/:id', requireRole('locatario'), async (req, res) => {
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
