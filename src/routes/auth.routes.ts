import { Router } from 'express'
import { createAnonClient, createServiceRoleClient } from '../lib/supabase'
import { badRequest, serverError } from '../utils/http'

const router = Router()

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }

  if (!email || !password) {
    return badRequest(res, 'Email y contrasena son obligatorios.')
  }

  const supabase = createAnonClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.toLowerCase().includes('rate limit')) {
      return res.status(429).json({ error: 'Demasiados intentos de inicio de sesion. Espera unos minutos e intentalo de nuevo.' })
    }
    return badRequest(res, error.message)
  }

  return res.json({ user: data.user, session: data.session })
})

router.post('/register', async (req, res) => {
  const { name, email, password, role, businessName, businessLocation, bio } = req.body as {
    name?: string
    email?: string
    password?: string
    role?: 'user' | 'locatario' | 'admin'
    businessName?: string
    businessLocation?: string
    bio?: string
  }

  if (!name || !email || !password) {
    return badRequest(res, 'Nombre, email y contrasena son obligatorios.')
  }

  if (password.length < 6) {
    return badRequest(res, 'La contrasena debe tener al menos 6 caracteres.')
  }

  if (role === 'admin') {
    return badRequest(res, 'No se puede crear una cuenta admin desde el registro publico.')
  }

  const profileRole = role === 'locatario' ? 'locatario' : 'user'
  const cleanBusinessName = profileRole === 'locatario' ? businessName?.trim() || null : null
  const cleanBusinessLocation = profileRole === 'locatario' ? businessLocation?.trim() || null : null

  if (profileRole === 'locatario' && !cleanBusinessName) {
    return badRequest(res, 'Nombre del negocio es obligatorio para locatarios.')
  }

  const supabase = createAnonClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: profileRole,
        business_name: cleanBusinessName,
        business_location: cleanBusinessLocation,
        bio: bio?.trim() || '',
      },
    },
  })

  if (error) {
    return badRequest(res, error.message)
  }

  if (data.user) {
    const serviceSupabase = createServiceRoleClient()
    const { error: profileError } = await serviceSupabase
      .from('profiles')
      .upsert(
        {
          id: data.user.id,
          name,
          role: profileRole,
          bio: bio?.trim() || '',
          business_name: cleanBusinessName,
          business_location: cleanBusinessLocation,
        },
        { onConflict: 'id' },
      )

    if (profileError) {
      return serverError(res, 'No se pudo guardar el perfil del usuario.')
    }
  }

  return res.status(201).json({ user: data.user, session: data.session })
})

router.post('/logout', async (req, res) => {
  const rawAuth = req.headers.authorization
  const token = rawAuth?.startsWith('Bearer ') ? rawAuth.slice(7) : undefined

  const supabase = createAnonClient(token)
  const { error } = await supabase.auth.signOut()

  if (error) {
    return serverError(res, error.message)
  }

  return res.status(204).send()
})

router.get('/session', async (req, res) => {
  const rawAuth = req.headers.authorization
  const token = rawAuth?.startsWith('Bearer ') ? rawAuth.slice(7) : undefined

  if (!token) {
    return res.json({ session: null })
  }

  const supabase = createAnonClient(token)
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    return serverError(res, error.message)
  }

  return res.json({ session: data.session })
})

export default router
