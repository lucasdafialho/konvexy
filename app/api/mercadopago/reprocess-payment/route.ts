import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    return null
  }
  
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// GET - Instruções de uso
export async function GET() {
  return NextResponse.json({
    endpoint: "Reprocessar Pagamento",
    usage: "POST /api/mercadopago/reprocess-payment",
    body: {
      payment_id: "ID do pagamento do MercadoPago (obrigatório)",
      secret: "Chave secreta para autorização (obrigatório)",
      email: "Email do usuário (opcional, usar se o MP mascarar o email)"
    },
    example: {
      payment_id: "135269792611",
      secret: "sua-chave-secreta",
      email: "usuario@email.com"
    }
  })
}

// POST - Reprocessar pagamento
export async function POST(request: NextRequest) {
  console.log('🔄 Reprocessamento de pagamento solicitado')

  try {
    const body = await request.json()
    const { payment_id, secret, email: manualEmail } = body

    // Validar secret (usar a mesma chave do webhook)
    const expectedSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET
    if (!expectedSecret || secret !== expectedSecret) {
      console.error('❌ Secret inválido')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!payment_id) {
      return NextResponse.json({ error: "payment_id é obrigatório" }, { status: 400 })
    }

    console.log('💰 Buscando pagamento:', payment_id)

    // Buscar detalhes do pagamento no MercadoPago
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: "MERCADOPAGO_ACCESS_TOKEN não configurado" }, { status: 500 })
    }

    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text()
      console.error('❌ Erro ao buscar pagamento:', mpResponse.status, errorText)
      return NextResponse.json({ 
        error: "Falha ao buscar pagamento no MercadoPago",
        status: mpResponse.status,
        details: errorText
      }, { status: 400 })
    }

    const payment = await mpResponse.json()
    console.log('📋 Pagamento encontrado:', {
      id: payment.id,
      status: payment.status,
      email: payment.payer?.email,
      amount: payment.transaction_amount
    })

    // Verificar se está aprovado
    if (payment.status !== "approved") {
      return NextResponse.json({
        error: "Pagamento não está aprovado",
        payment_status: payment.status,
        payment_id: payment.id
      }, { status: 400 })
    }

    // Validar email - tentar múltiplas fontes
    // 0. Email fornecido manualmente (prioridade máxima)
    // 1. metadata.user_email (mais confiável, definido por nós)
    // 2. payer.email (pode estar mascarado como XXXXXXXXXXX)
    let email = manualEmail || payment.metadata?.user_email || payment.payer?.email
    
    // Se o email está mascarado, tentar extrair do external_reference ou metadata
    if (!email || email === 'XXXXXXXXXXX' || email.includes('XXXX')) {
      console.log('⚠️ Email mascarado, buscando alternativas...')
      console.log('Metadata:', payment.metadata)
      console.log('External Reference:', payment.external_reference)
      
      // Tentar metadata
      if (payment.metadata?.user_email) {
        email = payment.metadata.user_email
      }
      
      if (!email || email === 'XXXXXXXXXXX') {
        return NextResponse.json({ 
          error: "Email do pagador mascarado pelo MercadoPago",
          hint: "Forneça o email manualmente no campo 'email'",
          usage: "Adicione '\"email\":\"usuario@email.com\"' no body da requisição",
          metadata: payment.metadata,
          external_reference: payment.external_reference
        }, { status: 400 })
      }
    }
    
    console.log('📧 Email encontrado:', email)

    // Identificar plano
    let planType = "starter"
    if (payment.metadata?.plan_type) {
      planType = payment.metadata.plan_type
    } else if (payment.external_reference) {
      const [plan] = payment.external_reference.split("_")
      if (["starter", "pro"].includes(plan)) planType = plan
    } else if (payment.transaction_amount >= 100) {
      planType = "pro"
    }

    console.log('🎯 Plano identificado:', planType, 'para:', email)

    // Conectar ao Supabase
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 })
    }

    // Buscar usuário (case-insensitive)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, plan')
      .ilike('email', email)
      .maybeSingle()

    if (profileError || !profile) {
      console.error('❌ Usuário não encontrado:', email)
      
      // Mostrar email real para debug
      const emailLower = email.toLowerCase().trim()
      return NextResponse.json({ 
        error: "Usuário não encontrado",
        email_from_mp: email,
        email_normalized: emailLower,
        details: profileError?.message,
        hint: "Verifique se este email está cadastrado na tabela profiles"
      }, { status: 404 })
    }

    console.log('👤 Usuário encontrado:', profile.id, 'plano atual:', profile.plan)

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
      return NextResponse.json({ error: "Falha ao atualizar perfil" }, { status: 500 })
    }

    console.log('🎉 SUCESSO! Pagamento reprocessado!')

    return NextResponse.json({
      success: true,
      message: "Pagamento reprocessado com sucesso!",
      data: {
        payment_id: payment.id,
        user_id: profile.id,
        email: email,
        old_plan: profile.plan,
        new_plan: planType,
        amount: payment.transaction_amount,
        expires_at: expiresAt.toISOString()
      }
    })

  } catch (error) {
    console.error('❌ ERRO:', error)
    return NextResponse.json({
      error: "Erro ao reprocessar pagamento",
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 })
  }
}

