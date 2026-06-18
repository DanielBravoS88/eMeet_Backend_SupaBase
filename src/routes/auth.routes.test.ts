import request from 'supertest'
import express from 'express'

const mockCreateAnonClient = jest.fn()
const mockCreateServiceRoleClient = jest.fn()

jest.mock('../lib/supabase', () => ({
  createAnonClient: mockCreateAnonClient,
  createServiceRoleClient: mockCreateServiceRoleClient,
}))

jest.mock('../config/env', () => ({
  env: {
    FRONTEND_ORIGIN: 'http://localhost:3000',
    PORT: 4000,
    SUPABASE_URL: 'http://fake.supabase.co',
    SUPABASE_ANON_KEY: 'fake-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'fake-service-key',
  },
}))

async function createApp() {
  const { default: authRouter } = await import('./auth.routes')
  const app = express()
  app.use(express.json())
  app.use('/auth', authRouter)
  return app
}

describe('POST /auth/forgot-password', () => {
  beforeEach(() => {
    mockCreateAnonClient.mockReset()
    mockCreateServiceRoleClient.mockReset()
  })

  it('responde 400 cuando falta el email', async () => {
    const app = await createApp()
    const res = await request(app).post('/auth/forgot-password').send({})
    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('responde 400 cuando el email tiene formato invalido', async () => {
    const app = await createApp()
    const res = await request(app).post('/auth/forgot-password').send({ email: 'no-es-un-email' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('responde 400 cuando el email no tiene dominio', async () => {
    const app = await createApp()
    const res = await request(app).post('/auth/forgot-password').send({ email: 'usuario@' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('responde 200 con mensaje seguro cuando el email es valido', async () => {
    mockCreateAnonClient.mockReturnValue({
      auth: {
        resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
      },
    })
    const app = await createApp()
    const res = await request(app).post('/auth/forgot-password').send({ email: 'usuario@ejemplo.com' })
    expect(res.status).toBe(200)
    expect(res.body.message).toBeDefined()
    expect(typeof res.body.message).toBe('string')
  })

  it('responde 200 con el mismo mensaje aunque el email no este registrado', async () => {
    mockCreateAnonClient.mockReturnValue({
      auth: {
        resetPasswordForEmail: jest.fn().mockResolvedValue({ error: { message: 'User not found' } }),
      },
    })
    const app = await createApp()
    const res = await request(app).post('/auth/forgot-password').send({ email: 'noexiste@ejemplo.com' })
    // No debe filtrar si el usuario existe o no
    expect(res.status).toBe(200)
    expect(res.body.message).toBeDefined()
  })
})

describe('POST /auth/reset-password', () => {
  beforeEach(() => {
    mockCreateAnonClient.mockReset()
    mockCreateServiceRoleClient.mockReset()
  })

  it('responde 400 cuando faltan token y contrasena', async () => {
    const app = await createApp()
    const res = await request(app).post('/auth/reset-password').send({})
    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('responde 400 cuando falta solo el token', async () => {
    const app = await createApp()
    const res = await request(app).post('/auth/reset-password').send({ newPassword: 'NuevaPass123' })
    expect(res.status).toBe(400)
  })

  it('responde 400 cuando la contrasena tiene menos de 8 caracteres', async () => {
    const app = await createApp()
    const res = await request(app).post('/auth/reset-password').send({ token: 'tok', newPassword: 'Ab1' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/8 caracteres/)
  })

  it('responde 400 cuando la contrasena no tiene mayuscula', async () => {
    const app = await createApp()
    const res = await request(app).post('/auth/reset-password').send({ token: 'tok', newPassword: 'minuscula123' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/mayuscula/)
  })

  it('responde 400 cuando la contrasena no tiene minuscula', async () => {
    const app = await createApp()
    const res = await request(app).post('/auth/reset-password').send({ token: 'tok', newPassword: 'MAYUSCULA123' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/minuscula/)
  })

  it('responde 400 cuando la contrasena no tiene numero', async () => {
    const app = await createApp()
    const res = await request(app).post('/auth/reset-password').send({ token: 'tok', newPassword: 'SinNumeroAqui' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/numero/)
  })

  it('responde 400 cuando el token es invalido o expirado', async () => {
    mockCreateAnonClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: { message: 'token expired' } }),
      },
    })
    const app = await createApp()
    const res = await request(app)
      .post('/auth/reset-password')
      .send({ token: 'token-expirado', newPassword: 'NuevaPass123' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('responde 400 cuando supabase no devuelve usuario', async () => {
    mockCreateAnonClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    })
    const app = await createApp()
    const res = await request(app)
      .post('/auth/reset-password')
      .send({ token: 'token-sin-usuario', newPassword: 'NuevaPass123' })
    expect(res.status).toBe(400)
  })

  it('actualiza la contrasena y responde 200 cuando todo es valido', async () => {
    mockCreateAnonClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-abc' } }, error: null }),
      },
    })
    mockCreateServiceRoleClient.mockReturnValue({
      auth: {
        admin: {
          updateUserById: jest.fn().mockResolvedValue({ data: {}, error: null }),
        },
      },
    })
    const app = await createApp()
    const res = await request(app)
      .post('/auth/reset-password')
      .send({ token: 'token-valido', newPassword: 'NuevaPass123' })
    expect(res.status).toBe(200)
    expect(res.body.message).toBeDefined()
  })

  it('responde 500 cuando falla la actualizacion en supabase', async () => {
    mockCreateAnonClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-abc' } }, error: null }),
      },
    })
    mockCreateServiceRoleClient.mockReturnValue({
      auth: {
        admin: {
          updateUserById: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
        },
      },
    })
    const app = await createApp()
    const res = await request(app)
      .post('/auth/reset-password')
      .send({ token: 'token-valido', newPassword: 'NuevaPass123' })
    expect(res.status).toBe(500)
    expect(res.body.error).toBeDefined()
  })
})

describe('POST /auth/login', () => {
  beforeEach(() => {
    mockCreateAnonClient.mockReset()
    mockCreateServiceRoleClient.mockReset()
  })

  it('responde 400 cuando falta el email o la contrasena', async () => {
    const app = await createApp()
    const res = await request(app).post('/auth/login').send({ email: 'a@b.com' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('responde 429 cuando supabase reporta rate limit', async () => {
    mockCreateAnonClient.mockReturnValue({
      auth: {
        signInWithPassword: jest
          .fn()
          .mockResolvedValue({ data: null, error: { message: 'Email rate limit exceeded' } }),
      },
    })
    const app = await createApp()
    const res = await request(app).post('/auth/login').send({ email: 'a@b.com', password: 'x' })
    expect(res.status).toBe(429)
    expect(res.body.error).toBeDefined()
  })

  it('responde 400 cuando las credenciales son invalidas', async () => {
    mockCreateAnonClient.mockReturnValue({
      auth: {
        signInWithPassword: jest
          .fn()
          .mockResolvedValue({ data: null, error: { message: 'Invalid login credentials' } }),
      },
    })
    const app = await createApp()
    const res = await request(app).post('/auth/login').send({ email: 'a@b.com', password: 'mala' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid login credentials')
  })

  it('responde 200 con user y session cuando el login es correcto', async () => {
    mockCreateAnonClient.mockReturnValue({
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({
          data: { user: { id: 'u1' }, session: { access_token: 'tok' } },
          error: null,
        }),
      },
    })
    const app = await createApp()
    const res = await request(app).post('/auth/login').send({ email: 'a@b.com', password: 'ok' })
    expect(res.status).toBe(200)
    expect(res.body.user).toEqual({ id: 'u1' })
    expect(res.body.session).toEqual({ access_token: 'tok' })
  })
})

describe('POST /auth/register', () => {
  beforeEach(() => {
    mockCreateAnonClient.mockReset()
    mockCreateServiceRoleClient.mockReset()
  })

  it('responde 400 cuando faltan campos obligatorios', async () => {
    const app = await createApp()
    const res = await request(app).post('/auth/register').send({ email: 'a@b.com', password: 'Abcdef1' })
    expect(res.status).toBe(400)
  })

  it('responde 400 cuando la contrasena tiene menos de 6 caracteres', async () => {
    const app = await createApp()
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Ana', email: 'a@b.com', password: 'Ab1' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/6 caracteres/)
  })

  it('rechaza crear cuentas admin desde el registro publico', async () => {
    const app = await createApp()
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Ana', email: 'a@b.com', password: 'Abcdef1', role: 'admin' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/admin/)
  })

  it('responde 400 cuando supabase falla al crear el usuario', async () => {
    mockCreateAnonClient.mockReturnValue({
      auth: {
        signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: { message: 'email ya usado' } }),
      },
    })
    const app = await createApp()
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Ana', email: 'a@b.com', password: 'Abcdef1' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('email ya usado')
  })

  it('responde 500 cuando falla el upsert del perfil', async () => {
    mockCreateAnonClient.mockReturnValue({
      auth: {
        signUp: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' }, session: null }, error: null }),
      },
    })
    mockCreateServiceRoleClient.mockReturnValue({
      from: jest.fn().mockReturnValue({
        upsert: jest.fn().mockResolvedValue({ error: { message: 'fallo perfil' } }),
      }),
    })
    const app = await createApp()
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Ana', email: 'a@b.com', password: 'Abcdef1', bio: '  hola  ' })
    expect(res.status).toBe(500)
    expect(res.body.error).toBeDefined()
  })

  it('responde 201 y guarda el perfil cuando el registro es exitoso', async () => {
    const upsert = jest.fn().mockResolvedValue({ error: null })
    mockCreateAnonClient.mockReturnValue({
      auth: {
        signUp: jest
          .fn()
          .mockResolvedValue({ data: { user: { id: 'u1' }, session: { access_token: 't' } }, error: null }),
      },
    })
    mockCreateServiceRoleClient.mockReturnValue({
      from: jest.fn().mockReturnValue({ upsert }),
    })
    const app = await createApp()
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Ana', email: 'a@b.com', password: 'Abcdef1' })
    expect(res.status).toBe(201)
    expect(res.body.user).toEqual({ id: 'u1' })
    expect(upsert).toHaveBeenCalled()
  })

  it('responde 201 sin upsert cuando supabase no devuelve usuario', async () => {
    const serviceClient = { from: jest.fn() }
    mockCreateAnonClient.mockReturnValue({
      auth: {
        signUp: jest.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      },
    })
    mockCreateServiceRoleClient.mockReturnValue(serviceClient)
    const app = await createApp()
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Ana', email: 'a@b.com', password: 'Abcdef1' })
    expect(res.status).toBe(201)
    expect(serviceClient.from).not.toHaveBeenCalled()
  })
})

describe('POST /auth/logout', () => {
  beforeEach(() => {
    mockCreateAnonClient.mockReset()
    mockCreateServiceRoleClient.mockReset()
  })

  it('responde 204 cuando el cierre de sesion es exitoso', async () => {
    mockCreateAnonClient.mockReturnValue({
      auth: { signOut: jest.fn().mockResolvedValue({ error: null }) },
    })
    const app = await createApp()
    const res = await request(app).post('/auth/logout').set('Authorization', 'Bearer tok123')
    expect(res.status).toBe(204)
  })

  it('responde 204 tambien sin token de autorizacion', async () => {
    mockCreateAnonClient.mockReturnValue({
      auth: { signOut: jest.fn().mockResolvedValue({ error: null }) },
    })
    const app = await createApp()
    const res = await request(app).post('/auth/logout')
    expect(res.status).toBe(204)
  })

  it('responde 500 cuando supabase falla al cerrar sesion', async () => {
    mockCreateAnonClient.mockReturnValue({
      auth: { signOut: jest.fn().mockResolvedValue({ error: { message: 'fallo signout' } }) },
    })
    const app = await createApp()
    const res = await request(app).post('/auth/logout')
    expect(res.status).toBe(500)
    expect(res.body.error).toBeDefined()
  })
})

describe('GET /auth/session', () => {
  beforeEach(() => {
    mockCreateAnonClient.mockReset()
    mockCreateServiceRoleClient.mockReset()
  })

  it('responde session null cuando no hay token', async () => {
    const app = await createApp()
    const res = await request(app).get('/auth/session')
    expect(res.status).toBe(200)
    expect(res.body.session).toBeNull()
  })

  it('responde la session cuando el token es valido', async () => {
    mockCreateAnonClient.mockReturnValue({
      auth: {
        getSession: jest
          .fn()
          .mockResolvedValue({ data: { session: { access_token: 'tok' } }, error: null }),
      },
    })
    const app = await createApp()
    const res = await request(app).get('/auth/session').set('Authorization', 'Bearer tok')
    expect(res.status).toBe(200)
    expect(res.body.session).toEqual({ access_token: 'tok' })
  })

  it('responde 500 cuando supabase falla al obtener la sesion', async () => {
    mockCreateAnonClient.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: { message: 'boom' } }),
      },
    })
    const app = await createApp()
    const res = await request(app).get('/auth/session').set('Authorization', 'Bearer tok')
    expect(res.status).toBe(500)
    expect(res.body.error).toBeDefined()
  })
})
