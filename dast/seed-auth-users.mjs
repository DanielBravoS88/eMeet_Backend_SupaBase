import { randomBytes } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

const required = (name) => {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Falta ${name}`)
  return value
}

const supabaseUrl = required('SUPABASE_URL')
const anonKey = required('SUPABASE_ANON_KEY')
const serviceRoleKey = required('SUPABASE_SERVICE_ROLE_KEY')
const outputPath = required('DAST_TOKEN_FILE')
const runId = (process.env.DAST_RUN_ID ?? Date.now().toString())
  .replace(/[^a-zA-Z0-9-]/g, '-')
  .slice(0, 48)

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const definitions = [
  {
    role: 'user',
    email: `dast-user-${runId}@example.test`,
    appMetadata: { role: 'user' },
    userMetadata: { name: 'DAST User', role: 'user', is_event_creator: false },
  },
  {
    role: 'creator',
    email: `dast-creator-${runId}@example.test`,
    appMetadata: { role: 'user' },
    userMetadata: {
      name: 'DAST Creator',
      role: 'user',
      is_event_creator: true,
      business_name: 'DAST Local Business',
      business_location: 'Localhost',
    },
  },
  {
    role: 'admin',
    email: `dast-admin-${runId}@example.test`,
    appMetadata: { role: 'admin' },
    userMetadata: { name: 'DAST Admin', role: 'admin', is_event_creator: false },
  },
]

const tokens = {}

for (const definition of definitions) {
  const password = `Dast-${randomBytes(24).toString('base64url')}9aA`
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: definition.email,
    password,
    email_confirm: true,
    app_metadata: definition.appMetadata,
    user_metadata: definition.userMetadata,
  })

  if (createError || !created.user) {
    throw new Error(`No se pudo crear ${definition.role}: ${createError?.message ?? 'sin usuario'}`)
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data: signedIn, error: signInError } = await authClient.auth.signInWithPassword({
    email: definition.email,
    password,
  })

  if (signInError || !signedIn.session?.access_token) {
    throw new Error(`No se pudo autenticar ${definition.role}: ${signInError?.message ?? 'sin token'}`)
  }

  tokens[definition.role] = {
    accessToken: signedIn.session.access_token,
    email: definition.email,
    userId: created.user.id,
  }

  console.log(`Cuenta DAST creada: ${definition.role} (${created.user.id})`)
}

await writeFile(outputPath, `${JSON.stringify(tokens, null, 2)}\n`, { mode: 0o600 })
console.log(`Tokens DAST guardados en archivo efimero: ${outputPath}`)
