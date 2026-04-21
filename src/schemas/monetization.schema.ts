import {
  PAYMENT_PROVIDERS,
  PROMOTION_TYPES,
  TOKEN_PACK_CODES,
  type PaymentProvider,
  type PromotionType,
  type TokenPackCode,
} from '../constants/monetization'

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === 'string' && options.some((option) => option === value)
}

export function parseCreatePurchaseInput(body: unknown) {
  const input = body as { packCode?: unknown; provider?: unknown }

  if (!isOneOf(input.packCode, TOKEN_PACK_CODES)) {
    return { ok: false as const, error: 'Pack de tokens no valido.' }
  }

  if (!isOneOf(input.provider, PAYMENT_PROVIDERS)) {
    return { ok: false as const, error: 'Metodo de pago no valido.' }
  }

  return { ok: true as const, data: { packCode: input.packCode, provider: input.provider } }
}

export function parseActivatePromotionInput(body: unknown) {
  const input = body as { eventId?: unknown; type?: unknown; durationDays?: unknown }
  const durationDays = Number(input.durationDays ?? 1)

  if (typeof input.eventId !== 'string') {
    return { ok: false as const, error: 'Evento no valido.' }
  }

  if (!isOneOf(input.type, PROMOTION_TYPES)) {
    return { ok: false as const, error: 'Tipo de promocion no valido.' }
  }

  if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 30) {
    return { ok: false as const, error: 'La duracion debe estar entre 1 y 30 dias.' }
  }

  return { ok: true as const, data: { eventId: input.eventId, type: input.type, durationDays } }
}

export function parseConfirmTransbankInput(body: unknown) {
  const input = body as { orderId?: unknown; tokenWs?: unknown }

  if (typeof input.orderId !== 'string' || typeof input.tokenWs !== 'string' || input.tokenWs.length < 10) {
    return { ok: false as const, error: 'Faltan datos para confirmar Transbank.' }
  }

  return { ok: true as const, data: { orderId: input.orderId, tokenWs: input.tokenWs } }
}

export function parseConfirmMercadoPagoInput(body: unknown) {
  const input = body as { orderId?: unknown; paymentId?: unknown }

  if (typeof input.orderId !== 'string') {
    return { ok: false as const, error: 'Faltan datos para confirmar Mercado Pago.' }
  }

  if (input.paymentId !== undefined && (typeof input.paymentId !== 'string' || input.paymentId.length < 1)) {
    return { ok: false as const, error: 'El pago de Mercado Pago no es valido.' }
  }

  return { ok: true as const, data: { orderId: input.orderId, paymentId: input.paymentId } }
}

export function parseValidateQrInput(body: unknown) {
  const input = body as { qrToken?: unknown }

  if (typeof input.qrToken !== 'string' || input.qrToken.trim().length < 20 || input.qrToken.length > 200) {
    return { ok: false as const, error: 'QR no valido.' }
  }

  return { ok: true as const, data: { qrToken: input.qrToken.trim() } }
}
