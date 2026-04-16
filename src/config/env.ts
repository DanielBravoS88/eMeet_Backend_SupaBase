import dotenv from 'dotenv'

dotenv.config()

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`)
  }
  return value
}

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  SUPABASE_URL: requireEnv('SUPABASE_URL'),
  SUPABASE_ANON_KEY: requireEnv('SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
  BACKEND_PUBLIC_URL: process.env.BACKEND_PUBLIC_URL ?? `http://localhost:${Number(process.env.PORT ?? 4000)}`,
  MERCADO_PAGO_ACCESS_TOKEN: process.env.MERCADO_PAGO_ACCESS_TOKEN ?? '',
  TRANSBANK_COMMERCE_CODE: process.env.TRANSBANK_COMMERCE_CODE ?? '',
  TRANSBANK_API_KEY: process.env.TRANSBANK_API_KEY ?? '',
  TRANSBANK_ENV: process.env.TRANSBANK_ENV ?? 'integration',
}
