import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env'
import authRouter from './routes/auth.routes'
import profileRouter from './routes/profile.routes'
import eventsRouter from './routes/events'
import chatRouter from './routes/chat'
import placesRouter from './routes/places.routes'
import adminRouter from './routes/admin.routes'
import monetizationRouter from './routes/monetization.routes'

const app = express()

app.use(helmet())

const allowedOrigins = new Set(
  [
    ...env.FRONTEND_ORIGIN.split(','),
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3008',
  ]
    .map((origin) => origin.trim())
    .filter(Boolean),
)

// Permite solo los despliegues de ESTE proyecto en Vercel (producción y previews),
// p. ej. e-meet-frontend-nine.vercel.app o e-meet-frontend-<hash>.vercel.app.
// Se evita el comodín *.vercel.app para no aceptar sitios de terceros con credentials:true.
const VERCEL_ORIGIN_RE = /^https:\/\/e-meet-frontend-[a-z0-9-]+\.vercel\.app$/i
// Permite cualquier puerto de localhost en desarrollo
const LOCALHOST_RE = /^http:\/\/localhost:\d+$/

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin) || VERCEL_ORIGIN_RE.test(origin) || LOCALHOST_RE.test(origin)) {
        callback(null, true)
        return
      }

      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: false }))
app.use(morgan('dev'))

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'emeet-backend', timestamp: new Date().toISOString() })
})

app.use('/auth', authRouter)
app.use('/profile', profileRouter)
app.use('/events', eventsRouter)
app.use('/chat', chatRouter)
app.use('/places', placesRouter)
app.use('/admin', adminRouter)
app.use('/monetization', monetizationRouter)

export default app
