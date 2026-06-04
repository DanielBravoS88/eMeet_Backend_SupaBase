import type { NextFunction, Request, Response } from 'express'
import { createAnonClient, createServiceRoleClient } from '../lib/supabase'
import { unauthorized } from '../utils/http'
import type { UserRole } from '../types/supabase'

const serviceSupabase = createServiceRoleClient()

function readRoleBucket(value: unknown): UserRole | null {
  if (!value || typeof value !== 'object') return null

  const role = (value as { role?: unknown }).role
  // 'locatario' es legacy: se promueve a 'user' (el flag is_event_creator lo distingue)
  if (role === 'locatario') return 'user'
  return role === 'admin' || role === 'user' ? role : null
}

function extractRole(req: Request): UserRole {
  const appRole = readRoleBucket(req.authUser?.app_metadata)
  if (appRole) return appRole

  const userRole = readRoleBucket(req.authUser?.user_metadata)
  if (userRole) return userRole

  return 'user'
}

function extractIsEventCreator(req: Request): boolean {
  const metadata = (req.authUser?.user_metadata ?? {}) as { is_event_creator?: unknown; role?: unknown }
  if (typeof metadata.is_event_creator === 'boolean') return metadata.is_event_creator
  // Legacy: cuentas viejas con role=locatario son creadores por defecto
  return metadata.role === 'locatario'
}

async function syncAuthProfile(req: Request) {
  const userMetadata = (req.authUser?.user_metadata ?? {}) as {
    name?: string | null
    avatar_url?: string | null
    business_name?: string | null
    business_location?: string | null
    is_event_creator?: boolean
  }

  const role = extractRole(req)
  const isEventCreator = extractIsEventCreator(req)
  const fallbackName = userMetadata.name?.trim() || req.authUser?.email?.split('@')[0] || 'Usuario'

  const { error } = await serviceSupabase
    .from('profiles')
    .upsert({
      id: req.authUser!.id,
      name: fallbackName,
      avatar_url: userMetadata.avatar_url ?? null,
      role,
      is_event_creator: isEventCreator,
      business_name: userMetadata.business_name ?? null,
      business_location: userMetadata.business_location ?? null,
    }, { onConflict: 'id' })

  if (error) {
    throw error
  }

  req.authProfile = {
    id: req.authUser!.id,
    role,
    is_event_creator: isEventCreator,
    business_name: userMetadata.business_name ?? null,
    business_location: userMetadata.business_location ?? null,
  }
}

export async function withAuth(req: Request, res: Response, next: NextFunction) {
  const rawAuth = req.headers.authorization
  const token = rawAuth?.startsWith('Bearer ') ? rawAuth.slice(7) : null

  if (!token) {
    return unauthorized(res, 'Falta token de autorizacion.')
  }

  const supabase = createAnonClient(token)
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return unauthorized(res, 'Sesion invalida o expirada.')
  }

  req.supabase = supabase
  req.authUser = data.user

  try {
    await syncAuthProfile(req)
  } catch (e) {
    console.error('[withAuth] syncAuthProfile falló:', e)
    // La sincronización de perfil es no-bloqueante: el usuario está autenticado
    // aunque el upsert falle (ej: service role key incorrecta en prod).
    req.authProfile = {
      id: data.user.id,
      role: extractRole(req),
      is_event_creator: extractIsEventCreator(req),
      business_name: null,
      business_location: null,
    }
  }

  next()
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.authProfile?.role ?? extractRole(req)

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'No tienes permisos para realizar esta accion.' })
    }

    next()
  }
}

/**
 * Middleware: requiere que el usuario tenga la capacidad de crear eventos.
 * Admin pasa automáticamente; cualquier user con is_event_creator=true también.
 */
export function requireEventCreator(req: Request, res: Response, next: NextFunction) {
  const role = req.authProfile?.role ?? extractRole(req)
  const isCreator = req.authProfile?.is_event_creator ?? extractIsEventCreator(req)

  if (role !== 'admin' && !isCreator) {
    return res.status(403).json({ error: 'Necesitas activar el modo creador para esta accion.' })
  }

  next()
}
