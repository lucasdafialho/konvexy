import Stripe from 'stripe'

// Instanciação lazy: não criar o cliente no carregamento do módulo.
// Evita crash de cold start / falha de build quando STRIPE_SECRET_KEY
// está ausente; o erro só aparece (e é tratado pela rota) se uma chamada
// Stripe for realmente feita sem a chave.
let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY não configurado')
    }
    _stripe = new Stripe(key, {
      apiVersion: '2026-06-24.dahlia' as any,
    })
  }
  return _stripe
}

// Proxy mantém a API `stripe.checkout.sessions.create(...)` nos call sites,
// mas só resolve o cliente real no primeiro acesso.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripe()
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

export const STRIPE_PLANS = {
  starter: {
    name: 'Starter',
    price: 49.9,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    features: [
      '100 gerações de Copy/mês',
      '50 gerações de Ads/mês',
      '20 gerações de Funil/mês',
      '20 gerações de Canvas/mês',
      'Acesso a todas as ferramentas',
      'Suporte por email',
    ],
  },
  pro: {
    name: 'Pro',
    price: 149.9,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      'Gerações ilimitadas',
      'Todas as ferramentas sem limites',
      'Suporte prioritário',
      'Acesso antecipado a novas features',
    ],
  },
} as const
