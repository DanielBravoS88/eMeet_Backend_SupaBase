import type { NextFunction, Request, Response } from 'express'
import { createAnonClient } from '../lib/supabase'
import { forbidden, serverError, unauthorized } from '../utils/http'

type ProfileRole = 'user' | 'locatario' | 'admin'

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

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (profileError || !profile) {
    return serverError(res, 'No se pudo validar el perfil del usuario.')
  }

  req.supabase = supabase
  req.authUser = data.user
  req.authProfile = profile
  next()
}

export function requireRole(roles: ProfileRole | ProfileRole[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles]

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.authProfile) {
      return unauthorized(res, 'Falta perfil autenticado.')
    }

    if (!allowedRoles.includes(req.authProfile.role)) {
      return forbidden(res, 'No tienes permisos para acceder a este recurso.')
    }

    next()
  }
}
