import type { NextFunction, Request, Response } from 'express'
import { withAuth } from './auth'

const { mockCreateAnonClient, mockServerError, mockUnauthorized } = vi.hoisted(() => ({
  mockCreateAnonClient: vi.fn(),
  mockServerError: vi.fn(),
  mockUnauthorized: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  createAnonClient: mockCreateAnonClient,
}))

vi.mock('../utils/http', () => ({
  forbidden: vi.fn(),
  serverError: mockServerError,
  unauthorized: mockUnauthorized,
}))

function createReq(headers?: Record<string, string | undefined>) {
  return { headers: headers ?? {} } as unknown as Request
}

function createRes() {
  return {} as Response
}

function createProfileQuery(profile: unknown, error: unknown = null) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: profile, error }),
  }
}

describe('withAuth middleware', () => {
  beforeEach(() => {
    mockCreateAnonClient.mockReset()
    mockServerError.mockReset()
    mockUnauthorized.mockReset()
  })

  it('rechaza cuando falta bearer token', async () => {
    const req = createReq()
    const res = createRes()
    const next = vi.fn() as unknown as NextFunction

    await withAuth(req, res, next)

    expect(mockUnauthorized).toHaveBeenCalledWith(res, 'Falta token de autorizacion.')
    expect(mockCreateAnonClient).not.toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('rechaza cuando supabase devuelve sesion invalida', async () => {
    const req = createReq({ authorization: 'Bearer token-invalido' })
    const res = createRes()
    const next = vi.fn() as unknown as NextFunction

    mockCreateAnonClient.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { message: 'invalid' } }),
      },
    })

    await withAuth(req, res, next)

    expect(mockCreateAnonClient).toHaveBeenCalledWith('token-invalido')
    expect(mockUnauthorized).toHaveBeenCalledWith(res, 'Sesion invalida o expirada.')
    expect(next).not.toHaveBeenCalled()
  })

  it('rechaza cuando no puede validar perfil', async () => {
    const req = createReq({ authorization: 'Bearer token-valido' })
    const res = createRes()
    const next = vi.fn() as unknown as NextFunction
    const profileQuery = createProfileQuery(null, { message: 'missing profile' })

    mockCreateAnonClient.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'test@mail.com' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue(profileQuery),
    })

    await withAuth(req, res, next)

    expect(mockServerError).toHaveBeenCalledWith(res, 'No se pudo validar el perfil del usuario.')
    expect(next).not.toHaveBeenCalled()
  })

  it('continua y adjunta usuario y perfil cuando token es valido', async () => {
    const req = createReq({ authorization: 'Bearer token-valido' })
    const res = createRes()
    const next = vi.fn() as unknown as NextFunction
    const profile = { id: 'user-1', name: 'Test', role: 'user' }
    const profileQuery = createProfileQuery(profile)
    const supabaseMock = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'test@mail.com' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue(profileQuery),
    }

    mockCreateAnonClient.mockReturnValue(supabaseMock)

    await withAuth(req, res, next)

    expect(mockCreateAnonClient).toHaveBeenCalledWith('token-valido')
    expect(supabaseMock.from).toHaveBeenCalledWith('profiles')
    expect(req.supabase).toBe(supabaseMock)
    expect(req.authUser).toEqual({ id: 'user-1', email: 'test@mail.com' })
    expect(req.authProfile).toBe(profile)
    expect(next).toHaveBeenCalledTimes(1)
    expect(mockUnauthorized).not.toHaveBeenCalled()
  })
})
