import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase-server'
import { validateRequest } from '@/lib/api-security'
import { RATE_LIMITS } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // CSRF + rate limit
  const validationError = await validateRequest(request, {
    requireCsrf: true,
    rateLimit: { ...RATE_LIMITS.api.profile, keyPrefix: 'customer-portal' },
  })
  if (validationError) return validationError

  try {
    // Email SEMPRE derivado da sessão autenticada — nunca do body (evita IDOR de billing)
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const customers = await stripe.customers.list({ email: user.email, limit: 1 })
    if (!customers.data.length) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura Stripe encontrada para este email' },
        { status: 404 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.konvexy.com.br'
    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${appUrl}/dashboard/planos`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Erro ao criar portal do cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao abrir portal de assinatura' },
      { status: 500 }
    )
  }
}
