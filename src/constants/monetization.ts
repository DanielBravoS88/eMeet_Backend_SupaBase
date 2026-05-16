export type TokenPackCode = 'starter' | 'growth' | 'pro'
export type PaymentProvider = 'mercadopago' | 'transbank_webpay'
export type PromotionType = 'featured' | 'geo_boost' | 'coupon' | 'premium_badge'

export const TOKEN_PACKS: Record<
  TokenPackCode,
  { code: TokenPackCode; name: string; tokens: number; amountClp: number }
> = {
  starter: { code: 'starter', name: 'Pack Inicial', tokens: 50, amountClp: 9900 },
  growth: { code: 'growth', name: 'Pack Crecimiento', tokens: 120, amountClp: 19900 },
  pro: { code: 'pro', name: 'Pack Pro', tokens: 300, amountClp: 44900 },
}

export const PROMOTION_COSTS: Record<PromotionType, number> = {
  featured: 10,
  geo_boost: 8,
  coupon: 25,
  premium_badge: 15,
}

export const TOKEN_PACK_CODES: readonly TokenPackCode[] = Object.keys(TOKEN_PACKS) as TokenPackCode[]
export const PAYMENT_PROVIDERS: readonly PaymentProvider[] = ['mercadopago', 'transbank_webpay']
export const PROMOTION_TYPES: readonly PromotionType[] = Object.keys(PROMOTION_COSTS) as PromotionType[]
