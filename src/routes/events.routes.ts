import { Router } from 'express'
import { createServiceRoleClient } from '../lib/supabase'
import { requireRole, withAuth } from '../middleware/auth'
import { badRequest, serverError } from '../utils/http'

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
  const { eventId, eventTitle, eventImageUrl, eventAddress } = req.body as {
    eventId?: string
    eventTitle?: string
    eventImageUrl?: string
    eventAddress?: string
  }

  if (!eventId || !eventTitle) {
    return badRequest(res, 'eventId y eventTitle son obligatorios.')
  }

  const { error: likeError } = await req.supabase!
    .from('user_events')
    .insert({
      user_id: req.authUser!.id,
      event_id: eventId,
      event_title: eventTitle,
      event_image_url: eventImageUrl ?? null,
      event_address: eventAddress ?? null,
      action: 'like',
    })

  // 23505 = unique_violation: el like ya existía, no es error real
  if (likeError && likeError.code !== '23505') {
    return serverError(res, 'No se pudo registrar el like.')
  }

  const { error: roomError } = await req.supabase!
    .from('chat_rooms')
    .insert({
      id: eventId,
      event_title: eventTitle,
      event_image_url: eventImageUrl ?? null,
      event_address: eventAddress ?? null,
    })

  // 23505 = la sala ya existe, no es error real
  if (roomError && roomError.code !== '23505') {
    return serverError(res, 'No se pudo crear la sala del evento.')
  }

  const { error: memberError } = await req.supabase!
    .from('room_members')
    .insert({
      room_id: eventId,
      user_id: req.authUser!.id,
    })

  // 23505 = el usuario ya es miembro, no es error real
  if (memberError && memberError.code !== '23505') {
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

  const { error } = await req.supabase!
    .from('user_events')
    .insert({
      user_id: req.authUser!.id,
      event_id: eventId,
      event_title: eventTitle,
      event_image_url: eventImageUrl ?? null,
      event_address: eventAddress ?? null,
      action: 'save',
    })

  // 23505 = unique_violation: el evento ya estaba guardado, no es error real
  if (error && error.code !== '23505') {
    return serverError(res, 'No se pudo guardar el evento.')
  }

  return res.status(201).json({ ok: true })
})

router.delete('/like/:id', async (req, res) => {
  const { id } = req.params

  const { error } = await req.supabase!
    .from('user_events')
    .delete()
    .eq('user_id', req.authUser!.id)
    .eq('event_id', id)
    .eq('action', 'like')

  if (error) {
    return serverError(res, 'No se pudo eliminar el like.')
  }

  return res.status(204).send()
})

router.delete('/save/:id', async (req, res) => {
  const { id } = req.params

  const { error } = await req.supabase!
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
  const { data, error } = await req.supabase!
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
  const { data, error } = await req.supabase!
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
  const { data, error } = await req.supabase!
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

  const { data, error } = await req.supabase!
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

  const { error } = await req.supabase!
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
