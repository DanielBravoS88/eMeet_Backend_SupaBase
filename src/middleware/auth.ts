import type { NextFunction, Request, Response } from 'express'
import { createAnonClient, createServiceRoleClient } from '../lib/supabase'
import { forbidden, serverError, unauthorized } from '../utils/http'
import type { UserRole } from '../types/supabase'

const serviceSupabase = createServiceRoleClient()

function readRoleBucket(value: unknown): UserRole | null {
  if (!value || typeof value !== 'object') return null

  const role = (value as { role?: unknown }).role
  return role === 'admin' || role === 'locatario' || role === 'user' ? role : null
}

function extractRole(req: Request): UserRole {
  const appRole = readRoleBucket(req.authUser?.app_metadata)
  if (appRole) return appRole

  const userRole = readRoleBucket(req.authUser?.user_metadata)
  if (userRole) return userRole

  return 'user'
}

async function syncAuthProfile(req: Request) {
  const userMetadata = (req.authUser?.user_metadata ?? {}) as {
    name?: string | null
    avatar_url?: string | null
    business_name?: string | null
    business_location?: string | null
  }

  const role = extractRole(req)
  const fallbackName = userMetadata.name?.trim() || req.authUser?.email?.split('@')[0] || 'Usuario'

  const { error } = await serviceSupabase
    .from('profiles')
    .upsert({
      id: req.authUser!.id,
      name: fallbackName,
      avatar_url: userMetadata.avatar_url ?? null,
      role,
      business_name: userMetadata.business_name ?? null,
      business_location: userMetadata.business_location ?? null,
    }, { onConflict: 'id' })

  if (error) {
    throw error
  }

  req.authProfile = {
    id: req.authUser!.id,
    role,
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

  const { error: profileError } = await serviceSupabase
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle()

  if (profileError) {
    return serverError(res, 'No se pudo validar el perfil del usuario.')
  }

  req.supabase = supabase
  req.authUser = data.user

  try {
    await syncAuthProfile(req)
  } catch (e) {
    console.error('[withAuth] syncAuthProfile falló:', e)
    return unauthorized(res, 'No se pudo sincronizar el perfil autenticado.')
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
