import { createServiceRoleClient } from '../lib/supabase'

const EVENT_IMAGES_BUCKET = 'event-images'
const EVENT_VIDEOS_BUCKET = 'event-videos'
const DEFAULT_INTERVAL_MS = 24 * 60 * 60 * 1000

type ExpiredEventRow = {
  id: string
  image_url: string | null
  video_url: string | null
}

type CleanupSummary = {
  deletedEvents: number
  deletedChatRooms: number
  deletedImageFiles: number
  deletedVideoFiles: number
  errors: string[]
}

type RemoveResult = {
  deletedCount: number
  errors: string[]
}

function extractObjectPath(fileUrl: string | null | undefined, bucket: string): string | null {
  if (!fileUrl) return null

  try {
    const parsed = new URL(fileUrl)
    const pathname = parsed.pathname

    const prefixes = [
      `/storage/v1/object/public/${bucket}/`,
      `/storage/v1/object/sign/${bucket}/`,
      `/object/public/${bucket}/`,
      `/object/sign/${bucket}/`,
    ]

    for (const prefix of prefixes) {
      const idx = pathname.indexOf(prefix)
      if (idx >= 0) {
        const objectPath = pathname.slice(idx + prefix.length)
        return objectPath ? decodeURIComponent(objectPath) : null
      }
    }

    return null
  } catch {
    return null
  }
}

async function removeObjectsFromBucket(bucket: string, objectPaths: string[]): Promise<RemoveResult> {
  if (objectPaths.length === 0) {
    return { deletedCount: 0, errors: [] }
  }

  const supabase = createServiceRoleClient()
  const errors: string[] = []
  let deletedCount = 0

  // Supabase remove supports batch arrays; chunk to avoid large payloads.
  for (let i = 0; i < objectPaths.length; i += 100) {
    const chunk = objectPaths.slice(i, i + 100)
    const { data, error } = await supabase.storage.from(bucket).remove(chunk)

    if (error) {
      errors.push(`${bucket}: ${error.message}`)
      continue
    }

    deletedCount += Array.isArray(data) ? data.length : 0
  }

  return { deletedCount, errors }
}

export async function runExpiredDataCleanup(): Promise<CleanupSummary> {
  const supabase = createServiceRoleClient()
  const nowIso = new Date().toISOString()

  const summary: CleanupSummary = {
    deletedEvents: 0,
    deletedChatRooms: 0,
    deletedImageFiles: 0,
    deletedVideoFiles: 0,
    errors: [],
  }

  const { data: expiredEvents, error: expiredEventsError } = await supabase
    .from('locatario_events')
    .select('id, image_url, video_url')
    .not('event_date', 'is', null)
    .lt('event_date', nowIso)

  if (expiredEventsError) {
    summary.errors.push(`locatario_events select: ${expiredEventsError.message}`)
    return summary
  }

  const rows = (expiredEvents ?? []) as ExpiredEventRow[]
  if (rows.length === 0) {
    return summary
  }

  const expiredEventIds = rows.map((row) => row.id)

  const imageObjectPaths = Array.from(
    new Set(rows.map((row) => extractObjectPath(row.image_url, EVENT_IMAGES_BUCKET)).filter((v): v is string => Boolean(v))),
  )

  const videoObjectPaths = Array.from(
    new Set(rows.map((row) => extractObjectPath(row.video_url, EVENT_VIDEOS_BUCKET)).filter((v): v is string => Boolean(v))),
  )

  const deletedRoomIds = new Set<string>()

  const { data: deletedRoomsByEventId, error: deleteRoomsByEventError } = await supabase
    .from('chat_rooms')
    .delete()
    .in('id', expiredEventIds)
    .select('id')

  if (deleteRoomsByEventError) {
    summary.errors.push(`chat_rooms delete by event id: ${deleteRoomsByEventError.message}`)
  } else {
    for (const room of deletedRoomsByEventId ?? []) {
      deletedRoomIds.add(room.id)
    }
  }

  const { data: deletedRoomsByDate, error: deleteRoomsByDateError } = await supabase
    .from('chat_rooms')
    .delete()
    .not('event_date', 'is', null)
    .lt('event_date', nowIso)
    .select('id')

  if (deleteRoomsByDateError) {
    summary.errors.push(`chat_rooms delete by date: ${deleteRoomsByDateError.message}`)
  } else {
    for (const room of deletedRoomsByDate ?? []) {
      deletedRoomIds.add(room.id)
    }
  }

  summary.deletedChatRooms = deletedRoomIds.size

  const { data: deletedEvents, error: deletedEventsError } = await supabase
    .from('locatario_events')
    .delete()
    .in('id', expiredEventIds)
    .select('id')

  if (deletedEventsError) {
    summary.errors.push(`locatario_events delete: ${deletedEventsError.message}`)
  } else {
    summary.deletedEvents = (deletedEvents ?? []).length
  }

  const [imagesRemove, videosRemove] = await Promise.all([
    removeObjectsFromBucket(EVENT_IMAGES_BUCKET, imageObjectPaths),
    removeObjectsFromBucket(EVENT_VIDEOS_BUCKET, videoObjectPaths),
  ])

  summary.deletedImageFiles = imagesRemove.deletedCount
  summary.deletedVideoFiles = videosRemove.deletedCount
  summary.errors.push(...imagesRemove.errors, ...videosRemove.errors)

  return summary
}

export function startExpiredDataCleanupJob(options?: {
  intervalMs?: number
  runOnStart?: boolean
}): void {
  const intervalMs = options?.intervalMs ?? DEFAULT_INTERVAL_MS
  const runOnStart = options?.runOnStart ?? true

  const run = async () => {
    const startedAt = Date.now()

    try {
      const summary = await runExpiredDataCleanup()
      const elapsedMs = Date.now() - startedAt

      if (summary.errors.length > 0) {
        console.error('[cleanup] completed with warnings', {
          elapsedMs,
          ...summary,
        })
        return
      }

      console.log('[cleanup] completed', {
        elapsedMs,
        ...summary,
      })
    } catch (error) {
      console.error('[cleanup] failed', error)
    }
  }

  if (runOnStart) {
    void run()
  }

  setInterval(() => {
    void run()
  }, intervalMs)
}
