import { Router, type Request } from 'express'
import { randomUUID } from 'node:crypto'
import { PROMOTION_COSTS, TOKEN_PACKS } from '../constants/monetization'
import { env } from '../config/env'
import { createServiceRoleClient } from '../lib/supabase'
import { withAuth } from '../middleware/auth'
import {
  parseActivatePromotionInput,
  parseConfirmMercadoPagoInput,
  parseConfirmTransbankInput,
  parseCreatePurchaseInput,
  parseValidateQrInput,
} from '../schemas/monetization.schema'
import { badRequest, serverError } from '../utils/http'

const router = Router()

const serviceSupabase = createServiceRoleClient()

function normalizeBaseUrl() {
  return env.FRONTEND_ORIGIN.replace(/\/$/, '')
}

async function ensureWallet(locatarioId: string) {
  const { data: existing, error: findError } = await serviceSupabase
    .from('token_wallets')
    .select('*')
    .eq('locatario_id', locatarioId)
    .maybeSingle()

  if (findError) throw findError
  if (existing) return existing

  const { data, error } = await serviceSupabase
    .from('token_wallets')
    .insert({ locatario_id: locatarioId, balance: 0 })
    .select('*')
    .single()

  if (error) throw error
  return data
}

async function creditTokens(orderId: string) {
  const { error: rpcError } = await serviceSupabase.rpc('credit_tokens_for_paid_order', {
    p_order_id: orderId,
  })

  if (rpcError) throw rpcError

  const { data: order, error: orderError } = await serviceSupabase
    .from('payment_orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (orderError) throw orderError
  return order
}

async function createMercadoPagoCheckout(order: {
  id: string
  pack_code: string
  token_amount: number
  amount_clp: number
}) {
  if (!env.MERCADO_PAGO_ACCESS_TOKEN) {
    throw new Error('Mercado Pago no esta configurado.')
  }

  const baseUrl = normalizeBaseUrl()
  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.MERCADO_PAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      external_reference: order.id,
      items: [
        {
          id: order.pack_code,
          title: `eMeet - ${order.token_amount} tokens promocionales`,
          quantity: 1,
          currency_id: 'CLP',
          unit_price: order.amount_clp,
        },
      ],
      back_urls: {
        success: `${baseUrl}/locatario?payment=success&order=${order.id}`,
        failure: `${baseUrl}/locatario?payment=failure&order=${order.id}`,
        pending: `${baseUrl}/locatario?payment=pending&order=${order.id}`,
      },
      notification_url: `${env.BACKEND_PUBLIC_URL.replace(/\/$/, '')}/monetization/mercadopago/webhook`,
    }),
  })

  if (!response.ok) {
    throw new Error('No se pudo crear la preferencia de Mercado Pago.')
  }

  const payload = await response.json() as {
    id?: string
    init_point?: string
    sandbox_init_point?: string
  }

  return {
    providerOrderId: payload.id ?? null,
    checkoutUrl: payload.init_point ?? payload.sandbox_init_point ?? null,
    raw: payload,
  }
}

async function createTransbankCheckout(order: {
  id: string
  amount_clp: number
}) {
  if (!env.TRANSBANK_COMMERCE_CODE || !env.TRANSBANK_API_KEY) {
    throw new Error('Transbank no esta configurado.')
  }

  const host = env.TRANSBANK_ENV === 'production'
    ? 'https://webpay3g.transbank.cl'
    : 'https://webpay3gint.transbank.cl'

  const response = await fetch(`${host}/rswebpaytransaction/api/webpay/v1.2/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Tbk-Api-Key-Id': env.TRANSBANK_COMMERCE_CODE,
      'Tbk-Api-Key-Secret': env.TRANSBANK_API_KEY,
    },
    body: JSON.stringify({
      buy_order: order.id,
      session_id: order.id,
      amount: order.amount_clp,
      return_url: `${normalizeBaseUrl()}/locatario?payment=transbank&order=${order.id}`,
    }),
  })

  if (!response.ok) {
    throw new Error('No se pudo crear la transaccion de Transbank.')
  }

  const payload = await response.json() as { token?: string; url?: string }
  return {
    providerOrderId: payload.token ?? null,
    checkoutUrl: payload.url && payload.token ? `${payload.url}?token_ws=${payload.token}` : null,
    raw: payload,
  }
}

async function commitTransbankTransaction(tokenWs: string) {
  if (!env.TRANSBANK_COMMERCE_CODE || !env.TRANSBANK_API_KEY) {
    throw new Error('Transbank no esta configurado.')
  }

  const host = env.TRANSBANK_ENV === 'production'
    ? 'https://webpay3g.transbank.cl'
    : 'https://webpay3gint.transbank.cl'

  const response = await fetch(`${host}/rswebpaytransaction/api/webpay/v1.2/transactions/${tokenWs}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Tbk-Api-Key-Id': env.TRANSBANK_COMMERCE_CODE,
      'Tbk-Api-Key-Secret': env.TRANSBANK_API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error('No se pudo confirmar la transaccion de Transbank.')
  }

  return response.json() as Promise<{
    buy_order?: string
    status?: string
    authorization_code?: string
    response_code?: number
  }>
}

async function getMercadoPagoPayment(paymentId: string) {
  if (!env.MERCADO_PAGO_ACCESS_TOKEN) {
    throw new Error('Mercado Pago no esta configurado.')
  }

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${env.MERCADO_PAGO_ACCESS_TOKEN}`,
    },
  })

  if (!response.ok) {
    throw new Error('No se pudo verificar el pago en Mercado Pago.')
  }

  return response.json() as Promise<{
    id?: number | string
    status?: string
    external_reference?: string
  }>
}

function getMercadoPagoWebhookPaymentId(req: Request) {
  const queryDataId = req.query['data.id']
  const bodyDataId = req.body?.data?.id
  const queryId = req.query.id
  const bodyId = req.body?.id

  const value = [queryDataId, bodyDataId, queryId, bodyId].find((candidate) => typeof candidate === 'string')
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

async function confirmMercadoPagoPayment(paymentId: string) {
  const payload = await getMercadoPagoPayment(paymentId)
  const orderId = payload.external_reference

  if (!orderId || payload.status !== 'approved') return null

  const { data: order, error: orderError } = await serviceSupabase
    .from('payment_orders')
    .select('*')
    .eq('id', orderId)
    .eq('provider', 'mercadopago')
    .single()

  if (orderError || !order) return null

  await serviceSupabase.from('payment_orders').update({
    provider_payment_id: String(payload.id ?? paymentId),
    raw_provider_response: payload,
  }).eq('id', order.id)

  return creditTokens(order.id)
}

router.post('/mercadopago/webhook', async (req, res) => {
  const paymentId = getMercadoPagoWebhookPaymentId(req)

  if (!paymentId) return res.status(200).json({ ok: true })

  try {
    await confirmMercadoPagoPayment(paymentId)
    return res.json({ ok: true })
  } catch {
    return res.status(200).json({ ok: true })
  }
})

router.use(withAuth)

router.get('/packs', (_req, res) => {
  return res.json(Object.values(TOKEN_PACKS))
})

router.get('/wallet', async (req, res) => {
  try {
    const wallet = await ensureWallet(req.authUser!.id)
    const { data: campaigns, error: campaignError } = await serviceSupabase
      .from('promotion_campaigns')
      .select('*')
      .eq('locatario_id', req.authUser!.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (campaignError) return serverError(res, 'No se pudieron cargar las campanas.')

    return res.json({ wallet, campaigns: campaigns ?? [] })
  } catch {
    return serverError(res, 'No se pudo cargar el saldo promocional.')
  }
})

router.post('/purchases', async (req, res) => {
  const parsed = parseCreatePurchaseInput(req.body)

  if (!parsed.ok) return badRequest(res, parsed.error)

  const { packCode, provider } = parsed.data
  const pack = TOKEN_PACKS[packCode]

  try {
    await ensureWallet(req.authUser!.id)

    const { data: order, error: orderError } = await serviceSupabase
      .from('payment_orders')
      .insert({
        locatario_id: req.authUser!.id,
        provider,
        pack_code: pack.code,
        token_amount: pack.tokens,
        amount_clp: pack.amountClp,
        status: 'pending',
      })
      .select('*')
      .single()

    if (orderError) return serverError(res, 'No se pudo crear la orden de pago.')

    const checkout = provider === 'mercadopago'
      ? await createMercadoPagoCheckout(order)
      : await createTransbankCheckout(order)

    const { data: updatedOrder, error: updateError } = await serviceSupabase
      .from('payment_orders')
      .update({
        provider_order_id: checkout.providerOrderId,
        checkout_url: checkout.checkoutUrl,
        raw_provider_response: checkout.raw,
      })
      .eq('id', order.id)
      .select('*')
      .single()

    if (updateError) return serverError(res, 'No se pudo guardar la orden de pago.')

    return res.status(201).json(updatedOrder)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo iniciar el pago.'
    return badRequest(res, message)
  }
})

router.post('/promotions', async (req, res) => {
  const parsed = parseActivatePromotionInput(req.body)

  if (!parsed.ok) return badRequest(res, parsed.error)

  const { eventId, type, durationDays } = parsed.data

  try {
    const { data: event, error: eventError } = await serviceSupabase
      .from('locatario_events')
      .select('id, creator_id')
      .eq('id', eventId)
      .eq('creator_id', req.authUser!.id)
      .single()

    if (eventError || !event) return badRequest(res, 'No puedes promocionar este evento.')

    await ensureWallet(req.authUser!.id)
    const tokenCost = PROMOTION_COSTS[type] * durationDays

    const startsAt = new Date()
    const endsAt = new Date(startsAt.getTime() + durationDays * 24 * 60 * 60 * 1000)

    const { data: campaignId, error: consumeError } = await serviceSupabase.rpc('consume_tokens_for_campaign', {
      p_locatario_id: req.authUser!.id,
      p_event_id: event.id,
      p_type: type,
      p_token_cost: tokenCost,
      p_starts_at: startsAt.toISOString(),
      p_ends_at: endsAt.toISOString(),
    })

    if (consumeError) {
      return badRequest(
        res,
        consumeError.message === 'insufficient_balance'
          ? 'Saldo insuficiente para activar esta promocion.'
          : 'No se pudo activar la promocion.',
      )
    }

    const { data: campaign, error: campaignError } = await serviceSupabase
      .from('promotion_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError) return serverError(res, 'No se pudo activar la promocion.')

    if (type === 'coupon') {
      const qrToken = randomUUID().replace(/-/g, '')
      await serviceSupabase.from('coupons').insert({
        campaign_id: campaign.id,
        title: 'Beneficio promocional',
        description: 'Cupón asociado a la campaña del evento.',
        qr_token: qrToken,
        status: 'active',
        expires_at: endsAt.toISOString(),
      })
    }

    const wallet = await ensureWallet(req.authUser!.id)
    return res.status(201).json({ campaign, wallet })
  } catch {
    return serverError(res, 'No se pudo activar la promocion.')
  }
})

router.post('/transbank/commit', async (req, res) => {
  const parsed = parseConfirmTransbankInput(req.body)

  if (!parsed.ok) return badRequest(res, parsed.error)

  const { orderId, tokenWs } = parsed.data

  try {
    const { data: order, error: orderError } = await serviceSupabase
      .from('payment_orders')
      .select('*')
      .eq('id', orderId)
      .eq('locatario_id', req.authUser!.id)
      .eq('provider', 'transbank_webpay')
      .single()

    if (orderError || !order) return badRequest(res, 'Orden de pago no valida.')

    const payload = await commitTransbankTransaction(tokenWs)
    if (payload.buy_order !== order.id || payload.status !== 'AUTHORIZED' || payload.response_code !== 0) {
      await serviceSupabase.from('payment_orders').update({
        status: 'failed',
        raw_provider_response: payload,
      }).eq('id', order.id)
      return badRequest(res, 'Transbank no autorizo el pago.')
    }

    await serviceSupabase.from('payment_orders').update({
      provider_payment_id: payload.authorization_code ?? null,
      raw_provider_response: payload,
    }).eq('id', order.id)

    const paidOrder = await creditTokens(order.id)
    return res.json(paidOrder)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo confirmar Transbank.'
    return badRequest(res, message)
  }
})

router.post('/mercadopago/confirm', async (req, res) => {
  const parsed = parseConfirmMercadoPagoInput(req.body)

  if (!parsed.ok) return badRequest(res, parsed.error)

  const { orderId, paymentId } = parsed.data

  try {
    const { data: order, error: orderError } = await serviceSupabase
      .from('payment_orders')
      .select('*')
      .eq('id', orderId)
      .eq('locatario_id', req.authUser!.id)
      .eq('provider', 'mercadopago')
      .single()

    if (orderError || !order) return badRequest(res, 'Orden de pago no valida.')

    const payload = await getMercadoPagoPayment(paymentId)
    if (payload.external_reference !== order.id || payload.status !== 'approved') {
      await serviceSupabase.from('payment_orders').update({
        status: payload.status === 'rejected' ? 'failed' : 'pending',
        provider_payment_id: String(payload.id ?? paymentId),
        raw_provider_response: payload,
      }).eq('id', order.id)
      return badRequest(res, 'Mercado Pago aun no confirma este pago.')
    }

    await serviceSupabase.from('payment_orders').update({
      provider_payment_id: String(payload.id ?? paymentId),
      raw_provider_response: payload,
    }).eq('id', order.id)

    const paidOrder = await creditTokens(order.id)
    return res.json(paidOrder)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo confirmar Mercado Pago.'
    return badRequest(res, message)
  }
})

router.post('/qr/validate', async (req, res) => {
  const parsed = parseValidateQrInput(req.body)

  if (!parsed.ok) return badRequest(res, parsed.error)

  const { qrToken } = parsed.data

  try {
    const { data: couponId, error: redeemError } = await serviceSupabase.rpc('redeem_promotion_coupon', {
      p_locatario_id: req.authUser!.id,
      p_qr_token: qrToken,
    })

    if (redeemError) {
      const message = redeemError.message === 'coupon_not_found'
        ? 'El beneficio no existe.'
        : redeemError.message === 'coupon_not_allowed'
          ? 'No puedes validar este beneficio.'
          : 'El beneficio no esta disponible.'

      return badRequest(res, message)
    }

    if (!couponId) {
      return badRequest(res, 'El beneficio no esta disponible.')
    }

    const { data: redeemed, error: couponError } = await serviceSupabase
      .from('coupons')
      .select('*')
      .eq('id', couponId)
      .single()

    if (couponError || !redeemed) {
      return serverError(res, 'No se pudo cargar el beneficio validado.')
    }

    const { data: campaign, error: campaignError } = await serviceSupabase
      .from('promotion_campaigns')
      .select('*')
      .eq('id', redeemed.campaign_id)
      .eq('locatario_id', req.authUser!.id)
      .single()

    if (campaignError || !campaign) {
      return serverError(res, 'No se pudo cargar la campana asociada.')
    }

    return res.json({ coupon: redeemed, campaign })
  } catch {
    return serverError(res, 'No se pudo validar el QR.')
  }
})

export default router
