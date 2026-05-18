import type { NextFunction, Request, Response } from 'express'
import { withAuth } from './auth'

jest.mock('../lib/supabase', () => ({
  createAnonClient: jest.fn(),
  createServiceRoleClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: null }),
    }),
  }),
}))

jest.mock('../utils/http', () => ({
  forbidden: jest.fn(),
  serverError: jest.fn(),
  unauthorized: jest.fn(),
}))

const supabaseMocks = jest.requireMock('../lib/supabase') as {
  createAnonClient: jest.Mock
  createServiceRoleClient: jest.Mock
}
const httpMocks = jest.requireMock('../utils/http') as {
  unauthorized: jest.Mock
}

const mockCreateAnonClient = supabaseMocks.createAnonClient
const mockUnauthorized = httpMocks.unauthorized
const serviceSupabaseMock = supabaseMocks.createServiceRoleClient.mock.results[0].value as {
  from: jest.Mock
}

function createReq(headers?: Record<string, string | undefined>) {
  return { headers: headers ?? {} } as unknown as Request
}

function createRes() {
  return {} as Response
}

const VALID_USER = {
  id: 'user-1',
  email: 'test@mail.com',
  app_metadata: {},
  user_metadata: { name: 'Test' },
}

describe('withAuth middleware', () => {
  beforeEach(() => {
    mockCreateAnonClient.mockReset()
    mockUnauthorized.mockReset()
    serviceSupabaseMock.from.mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: null }),
    })
  })

  it('rechaza cuando falta bearer token', async () => {
    const req = createReq()
    const res = createRes()
    const next = jest.fn() as unknown as NextFunction

    await withAuth(req, res, next)

    expect(mockUnauthorized).toHaveBeenCalledWith(res, 'Falta token de autorizacion.')
    expect(mockCreateAnonClient).not.toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('rechaza cuando supabase devuelve sesion invalida', async () => {
    const req = createReq({ authorization: 'Bearer token-invalido' })
    const res = createRes()
    const next = jest.fn() as unknown as NextFunction

    mockCreateAnonClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: { message: 'invalid' } }),
      },
    })

    await withAuth(req, res, next)

    expect(mockCreateAnonClient).toHaveBeenCalledWith('token-invalido')
    expect(mockUnauthorized).toHaveBeenCalledWith(res, 'Sesion invalida o expirada.')
    expect(next).not.toHaveBeenCalled()
  })

  it('continua con perfil mínimo cuando syncAuthProfile falla', async () => {
    const req = createReq({ authorization: 'Bearer token-valido' })
    const res = createRes()
    const next = jest.fn() as unknown as NextFunction

    mockCreateAnonClient.mockReturnValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: VALID_USER }, error: null }) },
    })
    serviceSupabaseMock.from.mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: { message: 'DB unavailable' } }),
    })

    await withAuth(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(mockUnauthorized).not.toHaveBeenCalled()
    expect((req as unknown as { authProfile: { id: string; role: string } }).authProfile).toMatchObject({
      id: 'user-1',
      role: 'user',
    })
  })

  it('continua y adjunta usuario y perfil cuando token es valido', async () => {
    const req = createReq({ authorization: 'Bearer token-valido' })
    const res = createRes()
    const next = jest.fn() as unknown as NextFunction

    const supabaseMock = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: VALID_USER }, error: null }) },
    }
    mockCreateAnonClient.mockReturnValue(supabaseMock)

    await withAuth(req, res, next)

    expect(mockCreateAnonClient).toHaveBeenCalledWith('token-valido')
    expect(req.supabase).toBe(supabaseMock)
    expect(req.authUser).toEqual(VALID_USER)
    expect(req.authProfile).toMatchObject({ id: 'user-1', role: 'user' })
    expect(next).toHaveBeenCalledTimes(1)
    expect(mockUnauthorized).not.toHaveBeenCalled()
  })
})
