import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Criar cliente Supabase de forma lazy
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    console.error('❌ Variáveis Supabase não configuradas:', { hasUrl: !!url, hasKey: !!key })
    return null
  }
  
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-signature, x-request-id',
    },
  })
}

export async function POST(request: NextRequest) {
  console.log('🔔 Webhook recebido!')
  
  try {
    // 1. Parse do body
    let body: any
    try {
      body = await request.json()
    } catch {
      const text = await request.text()
      body = text ? JSON.parse(text) : {}
    }

    console.log('📋 Dados:', JSON.stringify({
      type: body.type,
      action: body.action,
      dataId: body.data?.id,
      id: body.id
    }))

    // 2. Validar estrutura
    if (!body.type || !body.data?.id) {
      console.error('❌ Estrutura inválida')
      return NextResponse.json({ error: "Invalid structure" }, { status: 400 })
    }

    // 3. Verificar Supabase
    const supabase = getSupabase()
    if (!supabase) {
      console.error('❌ Supabase não configurado')
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    // 4. Só processar pagamentos aprovados
    if (body.type !== "payment") {
      console.log('📨 Tipo ignorado:', body.type)
      return NextResponse.json({ received: true, status: "ignored" })
    }

    // 5. Buscar detalhes do pagamento
    const paymentId = body.data.id
    console.log('💰 Buscando pagamento:', paymentId)

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN não configurado')
      return NextResponse.json({ error: "MP not configured" }, { status: 500 })
    }

    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    if (!mpResponse.ok) {
      console.error('❌ Erro ao buscar pagamento:', mpResponse.status)
      return NextResponse.json({ error: "Failed to fetch payment" }, { status: 500 })
    }

    const payment = await mpResponse.json()
    console.log('📋 Pagamento:', JSON.stringify({
      id: payment.id,
      status: payment.status,
      email: payment.payer?.email,
      amount: payment.transaction_amount
    }))

    // 6. Só processar se aprovado
    if (payment.status !== "approved") {
      console.log('⏳ Status não aprovado:', payment.status)
      return NextResponse.json({ received: true, status: payment.status })
    }

    // 7. Validar email
    const email = payment.payer?.email
    if (!email) {
      console.error('❌ Email não encontrado')
      return NextResponse.json({ error: "No email" }, { status: 400 })
    }

    // 8. Identificar plano
    let planType = "starter"
    if (payment.metadata?.plan_type) {
      planType = payment.metadata.plan_type
    } else if (payment.external_reference) {
      const [plan] = payment.external_reference.split("_")
      if (["starter", "pro"].includes(plan)) planType = plan
    } else if (payment.transaction_amount >= 100) {
      planType = "pro"
    }

    console.log('🎯 Plano:', planType, 'para:', email)

    // 9. Buscar usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, plan')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      console.error('❌ Usuário não encontrado:', email, profileError?.message)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log('👤 Usuário encontrado:', profile.id, 'plano atual:', profile.plan)

    // 10. Atualizar plano
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Verificar subscription existente
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', profile.id)
      .eq('status', 'active')
      .maybeSingle()

    if (existingSub) {
      // Atualizar existente
      await supabase
        .from('subscriptions')
        .update({
          plan_type: planType,
          mercadopago_payment_id: String(payment.id),
          expires_at: expiresAt.toISOString(),
          last_payment_date: now.toISOString(),
          last_payment_amount: payment.transaction_amount,
          updated_at: now.toISOString()
        })
        .eq('id', existingSub.id)
      
      console.log('✅ Subscription atualizada')
    } else {
      // Criar nova
      await supabase
        .from('subscriptions')
        .insert({
          user_id: profile.id,
          plan_type: planType,
          status: 'active',
          mercadopago_payment_id: String(payment.id),
          started_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          last_payment_date: now.toISOString(),
          last_payment_amount: payment.transaction_amount,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })
      
      console.log('✅ Subscription criada')
    }

    // Atualizar perfil
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        plan: planType,
        subscription_status: 'active',
        last_payment_id: String(payment.id),
        updated_at: now.toISOString()
      })
      .eq('id', profile.id)

    if (updateError) {
      console.error('❌ Erro ao atualizar perfil:', updateError.message)
      return NextResponse.json({ error: "Update failed" }, { status: 500 })
    }

    console.log('🎉 SUCESSO! Plano', planType, 'ativado para', email)

    return NextResponse.json({
      received: true,
      status: "success",
      plan: planType,
      userId: profile.id
    })

  } catch (error) {
    console.error('❌ ERRO:', error instanceof Error ? error.message : error)
    return NextResponse.json({
      error: "Processing error",
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 })
  }
}
