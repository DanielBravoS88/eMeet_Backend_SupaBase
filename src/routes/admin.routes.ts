import { Router } from 'express'
import { withAuth } from '../middleware/auth'
import { createServiceRoleClient } from '../lib/supabase'
import { serverError } from '../utils/http'
import type { User } from '@supabase/supabase-js'

const router = Router()

function readRoleBucket(value: unknown): 'admin' | 'locatario' | 'user' | undefined {
  if (!value || typeof value !== 'object') return undefined
  const role = (value as { role?: unknown }).role
  if (role === 'admin' || role === 'locatario' || role === 'user') {
    return role
  }
  return undefined
}

function extractRole(user: User | null | undefined): 'admin' | 'locatario' | 'user' | undefined {
  if (!user) return undefined

  const appRole = readRoleBucket(user.app_metadata)
  if (appRole) return appRole

  const userRole = readRoleBucket(user.user_metadata)
  if (userRole) return userRole

  return undefined
}

function ensureAdminOrReject(user: User | null | undefined) {
  const role = extractRole(user)
  return role === 'admin'
}

type ReportRow = {
  id: string
  type: 'spam' | 'inappropriate' | 'fake' | 'other'
  description: string
  target_type: 'event' | 'user' | 'comment'
  target_id: string
  reporter_id: string
  status: 'pending' | 'resolved' | 'dismissed'
  created_at: string
}

router.get('/stats', withAuth, async (req, res) => {
  if (!ensureAdminOrReject(req.authUser)) {
    return res.status(403).json({ error: 'No tienes permisos de administrador.' })
  }

  const supabase = createServiceRoleClient()

  const [
    profilesCountResult,
    locatarioEventsCountResult,
    communitiesCountResult,
    likesCountResult,
    savesCountResult,
    messagesCountResult,
    reportsPendingCountResult,
    recentProfilesResult,
    recentEventsResult,
    recentCommunitiesResult,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('locatario_events').select('id', { count: 'exact', head: true }),
    supabase.from('chat_rooms').select('id', { count: 'exact', head: true }),
    supabase.from('user_events').select('id', { count: 'exact', head: true }).eq('action', 'like'),
    supabase.from('user_events').select('id', { count: 'exact', head: true }).eq('action', 'save'),
    supabase.from('chat_messages').select('id', { count: 'exact', head: true }),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('id, name, created_at').order('created_at', { ascending: false }).limit(6),
    supabase
      .from('locatario_events')
      .select('id, title, category, address, created_at, organizer_name, status')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('chat_rooms')
      .select('id, event_title, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  if (
    profilesCountResult.error ||
    locatarioEventsCountResult.error ||
    communitiesCountResult.error ||
    likesCountResult.error ||
    savesCountResult.error ||
    messagesCountResult.error ||
    reportsPendingCountResult.error ||
    recentProfilesResult.error ||
    recentEventsResult.error ||
    recentCommunitiesResult.error
  ) {
    return serverError(res, 'No se pudieron obtener las estadísticas de administración.')
  }

  return res.json({
    kpis: {
      totalProfiles: profilesCountResult.count ?? 0,
      locatariosWithEvents: locatarioEventsCountResult.count ?? 0,
      totalEvents: locatarioEventsCountResult.count ?? 0,
      totalCommunities: communitiesCountResult.count ?? 0,
      totalLikes: likesCountResult.count ?? 0,
      totalSaves: savesCountResult.count ?? 0,
      totalMessages: messagesCountResult.count ?? 0,
      reportsPending: reportsPendingCountResult.count ?? 0,
    },
    recentProfiles: recentProfilesResult.data ?? [],
    recentEvents: recentEventsResult.data ?? [],
    recentCommunities: recentCommunitiesResult.data ?? [],
  })
})

router.get('/reports', withAuth, async (req, res) => {
  if (!ensureAdminOrReject(req.authUser)) {
    return res.status(403).json({ error: 'No tienes permisos de administrador.' })
  }

  const supabase = createServiceRoleClient()

  const reportsResult = await supabase
    .from('reports')
    .select('id, type, description, target_type, target_id, reporter_id, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (reportsResult.error) {
    return serverError(res, 'No se pudieron obtener los reportes.')
  }

  const reports = (reportsResult.data ?? []) as ReportRow[]

  const eventIds = reports
    .filter((report) => report.target_type === 'event')
    .map((report) => report.target_id)

  const uniqueEventIds = [...new Set(eventIds)]
  let eventTitleMap = new Map<string, string>()

  if (uniqueEventIds.length > 0) {
    const eventsResult = await supabase
      .from('locatario_events')
      .select('id, title')
      .in('id', uniqueEventIds)

    if (!eventsResult.error && eventsResult.data) {
      eventTitleMap = new Map(eventsResult.data.map((event) => [event.id, event.title]))
    }
  }

  return res.json({
    reports: reports.map((report) => ({
      ...report,
      target_title: report.target_type === 'event' ? eventTitleMap.get(report.target_id) ?? null : null,
    })),
  })
})

router.patch('/reports/:id', withAuth, async (req, res) => {
  if (!ensureAdminOrReject(req.authUser)) {
    return res.status(403).json({ error: 'No tienes permisos de administrador.' })
  }

  const status = (req.body as { status?: unknown }).status
  if (status !== 'resolved' && status !== 'dismissed') {
    return res.status(400).json({ error: 'Estado inválido. Usa resolved o dismissed.' })
  }

  const supabase = createServiceRoleClient()
  const { id } = req.params

  const updateResult = await supabase
    .from('reports')
    .update({
      status,
      resolved_by: req.authUser?.id ?? null,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, status, resolved_by, resolved_at')
    .single()

  if (updateResult.error) {
    return serverError(res, 'No se pudo actualizar el estado del reporte.')
  }

  return res.json(updateResult.data)
})

router.get('/finance', withAuth, async (req, res) => {
  if (!ensureAdminOrReject(req.authUser)) {
    return res.status(403).json({ error: 'No tienes permisos de administrador.' })
  }

  const supabase = createServiceRoleClient()
  const txResult = await supabase
    .from('transactions')
    .select('id, type, description, amount, status, event_id, user_id, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (txResult.error) {
    return serverError(res, 'No se pudieron obtener las transacciones.')
  }

  const transactions = txResult.data ?? []
  const now = new Date()

  const kpis = transactions.reduce(
    (acc, tx) => {
      const txDate = new Date(tx.created_at)
      const isCompleted = tx.status === 'completado'
      const isCurrentMonth =
        txDate.getUTCFullYear() === now.getUTCFullYear() &&
        txDate.getUTCMonth() === now.getUTCMonth()

      if (isCompleted) {
        acc.gmv += tx.amount
        if (isCurrentMonth) acc.monthRevenue += tx.amount
      }

      if (isCompleted && tx.type === 'ticket') {
        acc.ticketsSold += 1
      }

      return acc
    },
    { gmv: 0, monthRevenue: 0, ticketsSold: 0 },
  )

  return res.json({ transactions, kpis })
})

export default router
