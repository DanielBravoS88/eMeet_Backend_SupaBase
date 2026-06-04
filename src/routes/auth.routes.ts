import { Router } from 'express'
import { createAnonClient, createServiceRoleClient } from '../lib/supabase'
import { badRequest, serverError } from '../utils/http'
import { env } from '../config/env'

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
  // Modelo unificado: todo registro publico crea una cuenta 'user'.
  // La capacidad de crear eventos (antes rol 'locatario') ahora es la flag
  // is_event_creator, que el usuario activa desde su perfil (modo creador).
  const { name, email, password, role, bio } = req.body as {
    name?: string
    email?: string
    password?: string
    role?: 'user' | 'admin'
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

  const supabase = createAnonClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: 'user',
        is_event_creator: false,
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
          role: 'user',
          is_event_creator: false,
          bio: bio?.trim() || '',
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

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body as { email?: string }

  if (!email) {
    return badRequest(res, 'El email es obligatorio.')
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return badRequest(res, 'El formato del email no es valido.')
  }

  const frontendUrl = env.FRONTEND_ORIGIN.split(',')[0].trim()
  const supabase = createAnonClient()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${frontendUrl}/auth/reset-password`,
  })

  // Siempre respondemos igual para no filtrar si el email existe (previene enumeracion)
  return res.json({
    message: 'Si el email esta registrado, recibiras un enlace para restablecer tu contrasena.',
  })
})

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body as { token?: string; newPassword?: string }

  if (!token || !newPassword) {
    return badRequest(res, 'El token y la nueva contrasena son obligatorios.')
  }

  if (newPassword.length < 8) {
    return badRequest(res, 'La contrasena debe tener al menos 8 caracteres.')
  }
  if (!/[A-Z]/.test(newPassword)) {
    return badRequest(res, 'La contrasena debe contener al menos una letra mayuscula.')
  }
  if (!/[a-z]/.test(newPassword)) {
    return badRequest(res, 'La contrasena debe contener al menos una letra minuscula.')
  }
  if (!/[0-9]/.test(newPassword)) {
    return badRequest(res, 'La contrasena debe contener al menos un numero.')
  }

  const anonClient = createAnonClient(token)
  const { data: userData, error: userError } = await anonClient.auth.getUser()

  if (userError || !userData.user) {
    return badRequest(res, 'El token es invalido o ha expirado.')
  }

  const serviceClient = createServiceRoleClient()
  const { error: updateError } = await serviceClient.auth.admin.updateUserById(userData.user.id, {
    password: newPassword,
  })

  if (updateError) {
    return serverError(res, 'No se pudo actualizar la contrasena.')
  }

  return res.json({ message: 'Contrasena actualizada exitosamente.' })
})

export default router
