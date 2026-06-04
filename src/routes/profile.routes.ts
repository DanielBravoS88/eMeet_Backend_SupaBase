import { Router } from 'express'
import type { Request } from 'express'
import { createServiceRoleClient } from '../lib/supabase'
import { withAuth } from '../middleware/auth'
import { badRequest, serverError } from '../utils/http'
import type { EventCategory } from '../types/supabase'

const router = Router()
const serviceSupabase = createServiceRoleClient()

router.use(withAuth)

async function ensureOwnProfile(req: Request) {
  const metadata = (req.authUser?.user_metadata ?? {}) as {
    name?: string
    avatar_url?: string | null
  }

  const { data, error } = await serviceSupabase
    .from('profiles')
    .select('*')
    .eq('id', req.authUser!.id)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (data) {
    return data
  }

  const { data: createdProfile, error: createError } = await serviceSupabase
    .from('profiles')
    .insert({
      id: req.authUser!.id,
      name: metadata.name?.trim() || req.authUser!.email?.split('@')[0] || 'Usuario',
      avatar_url: metadata.avatar_url ?? null,
      bio: '',
      location: '',
      interests: [],
    })
    .select('*')
    .single()

  if (createError) {
    throw createError
  }

  return createdProfile
}

router.get('/', async (req, res) => {
  try {
    const profile = await ensureOwnProfile(req)
    return res.json(profile)
  } catch {
    return serverError(res, 'No se pudo obtener el perfil.')
  }
})

router.patch('/', async (req, res) => {
  const { name, bio, avatar_url, location, interests, business_name, business_location, is_event_creator } = req.body as {
    name?: string
    bio?: string
    avatar_url?: string | null
    location?: string
    interests?: EventCategory[]
    business_name?: string | null
    business_location?: string | null
    is_event_creator?: boolean
  }

  const payload: {
    name?: string
    bio?: string
    avatar_url?: string | null
    location?: string
    interests?: EventCategory[]
    business_name?: string | null
    business_location?: string | null
    is_event_creator?: boolean
  } = {}

  if (typeof name === 'string') payload.name = name
  if (typeof bio === 'string') payload.bio = bio
  if (typeof avatar_url === 'string' || avatar_url === null) payload.avatar_url = avatar_url
  if (typeof location === 'string') payload.location = location
  if (Array.isArray(interests)) payload.interests = interests
  if (typeof business_name === 'string' || business_name === null) payload.business_name = business_name
  if (typeof business_location === 'string' || business_location === null) payload.business_location = business_location
  if (typeof is_event_creator === 'boolean') payload.is_event_creator = is_event_creator

  if (Object.keys(payload).length === 0) {
    return badRequest(res, 'No hay campos para actualizar.')
  }

  const { data, error } = await serviceSupabase
    .from('profiles')
    .update(payload)
    .eq('id', req.authUser!.id)
    .select('*')
    .single()

  if (error) {
    return serverError(res, 'No se pudo actualizar el perfil.')
  }

  // Si cambió is_event_creator, sincronizamos auth.users user_metadata para que
  // el middleware (que lee del JWT) vea el cambio sin requerir refresh manual.
  if (typeof is_event_creator === 'boolean') {
    const metadataPatch: Record<string, unknown> = { is_event_creator }
    if (typeof business_name === 'string' || business_name === null) {
      metadataPatch.business_name = business_name
    }
    if (typeof business_location === 'string' || business_location === null) {
      metadataPatch.business_location = business_location
    }
    await serviceSupabase.auth.admin.updateUserById(req.authUser!.id, {
      user_metadata: metadataPatch,
    }).catch((err) => {
      // No bloqueamos la respuesta — el profile ya quedó actualizado.
      console.error('[profile PATCH] fallo al sincronizar user_metadata:', err)
    })
  }

  return res.json(data)
})

router.post('/avatar', async (req, res) => {
  const { fileBase64, contentType = 'image/jpeg' } = req.body as {
    fileBase64?: string
    contentType?: string
  }

  if (!fileBase64) {
    return badRequest(res, 'Debe enviar fileBase64 para subir el avatar.')
  }

  const buffer = Buffer.from(fileBase64, 'base64')
  const ext = contentType.includes('png') ? 'png' : 'jpg'
  const objectPath = `${req.authUser!.id}/${Date.now()}.${ext}`

  const { error: uploadError } = await serviceSupabase.storage
    .from('avatars')
    .upload(objectPath, buffer, {
      contentType,
      upsert: true,
    })

  if (uploadError) {
    return serverError(res, 'No se pudo subir el avatar.')
  }

  const { data: publicData } = serviceSupabase.storage.from('avatars').getPublicUrl(objectPath)

  const { error: updateError } = await serviceSupabase
    .from('profiles')
    .update({ avatar_url: publicData.publicUrl })
    .eq('id', req.authUser!.id)

  if (updateError) {
    return serverError(res, 'No se pudo guardar la URL del avatar.')
  }

  return res.json({ avatarUrl: publicData.publicUrl })
})

export default router
