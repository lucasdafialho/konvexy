// Fonte única de verdade dos planos (independente do provedor de pagamento).
// Preço/priceId específicos de Stripe ficam em lib/stripe.ts.

export type PlanId = "free" | "starter" | "pro"

export interface PlanConfig {
  name: string
  price: number
  limit: number
  features: string[]
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    name: "Gratuito",
    price: 0,
    limit: 5,
    features: [
      "5 gerações de Copy por mês",
      "Acesso ao Gerador de Copy",
      "Suporte por email",
    ],
  },
  starter: {
    name: "Starter",
    price: 49.9,
    limit: 190, // 100 copy + 50 ads + 20 funnel + 20 canvas
    features: [
      "100 gerações de Copy/mês",
      "50 gerações de Ads/mês",
      "20 gerações de Funil/mês",
      "20 gerações de Canvas/mês",
      "Acesso a todas as ferramentas",
      "Suporte por email",
    ],
  },
  pro: {
    name: "Pro",
    price: 149.9,
    limit: -1,
    features: [
      "Gerações ilimitadas",
      "Todas as ferramentas sem limites",
      "Suporte prioritário",
      "Acesso antecipado a novas features",
    ],
  },
}
