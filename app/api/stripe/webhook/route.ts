import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// Nota: as colunas do banco ainda se chamam `mercadopago_payment_id` /
// `mercadopago_subscription_id` por legado — hoje armazenam IDs do Stripe.
// (renomear exige migração; mantido para não quebrar dados em produção.)
async function activateUserPlan(
  email: string,
  planType: string,
  stripeSubscriptionId: string,
  userId?: string
) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase não configurado')

  // Preferir user_id (imutável) do metadata; email é fallback.
  let profileQuery = supabase.from('profiles').select('id, email, plan')
  profileQuery = userId
    ? profileQuery.eq('id', userId)
    : profileQuery.ilike('email', email)

  const { data: profile, error } = await profileQuery.maybeSingle()

  if (error || !profile) {
    console.error('❌ Usuário não encontrado:', userId || email)
    return false
  }

  const now = new Date()
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', profile.id)
    .eq('status', 'active')
    .maybeSingle()

  if (existingSub) {
    await supabase
      .from('subscriptions')
      .update({
        plan_type: planType,
        mercadopago_payment_id: stripeSubscriptionId,
        expires_at: expiresAt.toISOString(),
        last_payment_date: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', existingSub.id)
  } else {
    await supabase
      .from('subscriptions')
      .insert({
        user_id: profile.id,
        plan_type: planType,
        status: 'active',
        mercadopago_payment_id: stripeSubscriptionId,
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        last_payment_date: now.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
  }

  await supabase
    .from('profiles')
    .update({
      plan: planType,
      subscription_status: 'active',
      last_payment_id: stripeSubscriptionId,
      updated_at: now.toISOString(),
    })
    .eq('id', profile.id)

  console.log(`✅ Plano ${planType} ativado para ${email}`)
  return true
}

async function cancelUserPlan(email: string, userId?: string) {
  const supabase = getSupabase()
  if (!supabase) return

  let profileQuery = supabase.from('profiles').select('id')
  profileQuery = userId
    ? profileQuery.eq('id', userId)
    : profileQuery.ilike('email', email)

  const { data: profile } = await profileQuery.maybeSingle()

  if (!profile) return

  await supabase
    .from('subscriptions')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('user_id', profile.id)
    .eq('status', 'active')

  await supabase
    .from('profiles')
    .update({ plan: 'free', subscription_status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', profile.id)

  console.log(`✅ Assinatura cancelada para ${email}`)
}

export async function GET() {
  return NextResponse.json({
    status: 'Stripe webhook ativo',
    configured: {
      stripe_key: !!process.env.STRIPE_SECRET_KEY ? '✅' : '❌',
      webhook_secret: !!process.env.STRIPE_WEBHOOK_SECRET ? '✅' : '❌',
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌',
    },
  })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    console.error('❌ Assinatura ou webhook secret ausentes')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('❌ Assinatura do webhook inválida:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('🔔 Stripe event:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        // Só ativa se o pagamento já foi confirmado. Boleto/PIX completam a
        // sessão com payment_status 'unpaid'/'no_payment_required' — nesses
        // casos a ativação real vem via invoice.payment_succeeded.
        if (session.payment_status !== 'paid') {
          console.log('⏳ Checkout completo mas pagamento pendente:', session.payment_status)
          break
        }

        const email = session.customer_email || (session.metadata?.user_email ?? '')
        const userId = session.metadata?.user_id || undefined
        const planType = session.metadata?.plan_type || 'starter'
        const subscriptionId = session.subscription as string

        if (email || userId) {
          await activateUserPlan(email, planType, subscriptionId, userId)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const invoiceSubscription = (invoice as any).subscription as string | null
        if (!invoiceSubscription) break

        const subscription = await stripe.subscriptions.retrieve(invoiceSubscription)
        const email = subscription.metadata?.user_email || ''
        const userId = subscription.metadata?.user_id || undefined
        const planType = subscription.metadata?.plan_type || 'starter'

        if (email || userId) {
          await activateUserPlan(email, planType, subscription.id, userId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const email = subscription.metadata?.user_email || ''
        const userId = subscription.metadata?.user_id || undefined

        if (email || userId) {
          await cancelUserPlan(email, userId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const email = subscription.metadata?.user_email || ''
        const userId = subscription.metadata?.user_id || undefined
        const planType = subscription.metadata?.plan_type || 'starter'

        // Cancelamento/vencimento => rebaixa; ativo/renovado => ativa.
        if (['canceled', 'unpaid', 'incomplete_expired'].includes(subscription.status)) {
          if (email || userId) await cancelUserPlan(email, userId)
        } else if (subscription.status === 'active') {
          if (email || userId) await activateUserPlan(email, planType, subscription.id, userId)
        }
        break
      }

      default:
        console.log('↩️  Evento ignorado:', event.type)
    }
  } catch (err) {
    console.error('❌ Erro ao processar evento:', err)
    return NextResponse.json({ error: 'Processing error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
