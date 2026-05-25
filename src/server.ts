import app from './app'
import { env } from './config/env'
import { startExpiredDataCleanupJob } from './services/expiryCleanupService'

if (env.CLEANUP_ENABLED) {
  const intervalMinutes = Number.isFinite(env.CLEANUP_INTERVAL_MINUTES)
    ? Math.max(1, env.CLEANUP_INTERVAL_MINUTES)
    : 1440

  startExpiredDataCleanupJob({
    intervalMs: intervalMinutes * 60 * 1000,
    runOnStart: env.CLEANUP_RUN_ON_START,
  })
}

app.listen(env.PORT, () => {
  console.log(`eMeet backend escuchando en http://localhost:${env.PORT}`)
})
