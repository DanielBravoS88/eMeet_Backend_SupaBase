import { readFile } from 'node:fs/promises'

const required = (name) => {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Falta ${name}`)
  return value.replace(/\/$/, '')
}

const backendUrl = required('DAST_BACKEND_URL')
const tokenFile = required('DAST_TOKEN_FILE')
const tokens = JSON.parse(await readFile(tokenFile, 'utf8'))

const cases = [
  { role: 'anonymous', path: '/health', expected: 200 },
  { role: 'anonymous', path: '/profile', expected: 401 },
  { role: 'anonymous', path: '/admin/stats', expected: 401 },

  { role: 'user', path: '/profile', expected: 200 },
  { role: 'user', path: '/events/liked', expected: 200 },
  { role: 'user', path: '/events/saved', expected: 200 },
  { role: 'user', path: '/chat/rooms', expected: 200 },
  { role: 'user', path: '/admin/stats', expected: 403 },
  { role: 'user', path: '/admin/reports', expected: 403 },
  { role: 'user', path: '/admin/finance', expected: 403 },
  { role: 'user', path: '/monetization/coupons', expected: 403 },

  { role: 'creator', path: '/profile', expected: 200 },
  { role: 'creator', path: '/events/locatario', expected: 200 },
  { role: 'creator', path: '/events/locatario/stats', expected: 200 },
  { role: 'creator', path: '/monetization/coupons', expected: 200 },
  { role: 'creator', path: '/admin/stats', expected: 403 },

  { role: 'admin', path: '/profile', expected: 200 },
  { role: 'admin', path: '/admin/stats', expected: 200 },
  { role: 'admin', path: '/admin/reports', expected: 200 },
  { role: 'admin', path: '/admin/finance', expected: 200 },
  { role: 'admin', path: '/monetization/coupons', expected: 200 },
]

for (const testCase of cases) {
  const headers = {}
  if (testCase.role !== 'anonymous') {
    const token = tokens[testCase.role]?.accessToken
    if (!token) throw new Error(`No existe token para ${testCase.role}`)
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${backendUrl}${testCase.path}`, {
    headers,
    signal: AbortSignal.timeout(10_000),
  })

  console.log(`${testCase.role.padEnd(9)} ${testCase.path.padEnd(28)} ${response.status}`)
  if (response.status !== testCase.expected) {
    throw new Error(
      `Autorizacion inesperada: ${testCase.role} ${testCase.path} esperaba ${testCase.expected} y recibio ${response.status}`,
    )
  }
}

console.log(`Matriz de autorizacion validada: ${cases.length} casos.`)
