import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PLANS } from '@/lib/stripe'
import { createClient } from '@/lib/supabase-server'
import { validateRequest } from '@/lib/api-security'
import { RATE_LIMITS } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // CSRF + rate limit
  const validationError = await validateRequest(request, {
    requireCsrf: true,
    rateLimit: { ...RATE_LIMITS.api.profile, keyPrefix: 'checkout-session' },
  })
  if (validationError) return validationError

  try {
    // Email/nome SEMPRE da sessão — não confiar no body
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { planType } = body

    if (!['starter', 'pro'].includes(planType)) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
    }

    const userEmail = user.email
    const plan = STRIPE_PLANS[planType as 'starter' | 'pro']

    if (!plan.priceId) {
      return NextResponse.json(
        { error: `STRIPE_${planType.toUpperCase()}_PRICE_ID não configurado` },
        { status: 500 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.konvexy.com.br'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: userEmail,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      subscription_data: {
        metadata: {
          plan_type: planType,
          user_email: userEmail,
          user_id: user.id,
        },
      },
      metadata: {
        plan_type: planType,
        user_email: userEmail,
        user_id: user.id,
      },
      success_url: `${appUrl}/dashboard/planos?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/planos`,
      locale: 'pt-BR',
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Erro ao criar checkout session:', error)
    return NextResponse.json(
      { error: 'Erro ao criar sessão de pagamento' },
      { status: 500 }
    )
  }
}
