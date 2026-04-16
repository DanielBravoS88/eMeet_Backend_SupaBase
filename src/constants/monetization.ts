export const TOKEN_PACKS = {
  starter: { code: 'starter', name: 'Pack Inicial', tokens: 50, amountClp: 9900 },
  growth: { code: 'growth', name: 'Pack Crecimiento', tokens: 120, amountClp: 19900 },
  pro: { code: 'pro', name: 'Pack Pro', tokens: 300, amountClp: 44900 },
} as const

export const PROMOTION_COSTS = {
  featured: 10,
  geo_boost: 8,
  coupon: 25,
  premium_badge: 15,
} as const

export const TOKEN_PACK_CODES = Object.keys(TOKEN_PACKS) as Array<keyof typeof TOKEN_PACKS>
export const PAYMENT_PROVIDERS = ['mercadopago', 'transbank_webpay'] as const
export const PROMOTION_TYPES = Object.keys(PROMOTION_COSTS) as Array<keyof typeof PROMOTION_COSTS>

export type TokenPackCode = keyof typeof TOKEN_PACKS
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number]
export type PromotionType = keyof typeof PROMOTION_COSTS
