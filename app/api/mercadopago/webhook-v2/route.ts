import { NextRequest, NextResponse } from "next/server"
import { MercadoPagoService } from "@/lib/mercadopago"
import secureLogger from "@/lib/logger"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Importação lazy do Supabase para evitar crash
let supabaseAdmin: any = null

async function getSupabaseClient() {
  if (supabaseAdmin) return supabaseAdmin
  
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!url || !key) {
      console.error('❌ Variáveis do Supabase não configuradas:', { hasUrl: !!url, hasKey: !!key })
      return null
    }
    
    supabaseAdmin = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    return supabaseAdmin
  } catch (error) {
    console.error('❌ Erro ao criar cliente Supabase:', error)
    return null
  }
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
  const startTime = Date.now()
  let webhookId = ''
  let body: any = {}

  try {
    // 1. PARSE DO CORPO (primeiro, para termos dados para log)
    try {
      const contentType = request.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        body = await request.json()
      } else {
        const text = await request.text()
        body = text ? JSON.parse(text) : {}
      }
    } catch (parseError) {
      console.error('❌ Erro ao parsear body:', parseError)
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    console.log("🔔 Webhook MercadoPago recebido:", {
      type: body.type,
      action: body.action,
      dataId: body.data?.id,
      webhookId: body.id,
      liveMode: body.live_mode
    })

    // 2. VALIDAR ESTRUTURA BÁSICA
    if (!body.type || !body.data?.id) {
      console.warn("⚠️ Webhook com estrutura inválida:", body)
      return NextResponse.json({ error: "Invalid webhook structure" }, { status: 400 })
    }

    // 3. VERIFICAR SUPABASE (lazy load)
    const db = await getSupabaseClient()
    if (!db) {
      console.error("❌ Supabase não configurado")
      // Mesmo sem banco, vamos tentar processar o pagamento
      // e ativar o plano diretamente
    }

    // 4. GERAR ID DO WEBHOOK
    webhookId = body.id ? `mp_${body.id}` : `mp_${body.type}_${body.data.id}_${Date.now()}`

    // 5. VERIFICAR/REGISTRAR WEBHOOK (se tiver banco)
    if (db) {
      try {
        // Verificar se já foi processado
        const { data: existing } = await db
          .from('webhook_events')
          .select('id, status')
          .eq('webhook_id', webhookId)
          .maybeSingle()

        if (existing) {
          console.log("✅ Webhook já processado:", webhookId)
          return NextResponse.json({ received: true, status: "already_processed" })
        }

        // Registrar webhook
        const { error: insertError } = await db
          .from('webhook_events')
          .insert({
            webhook_id: webhookId,
            event_type: body.type,
            payment_id: String(body.data.id),
            status: 'processing',
            raw_data: body
          })

        if (insertError && insertError.code === '23505') {
          console.log("⚠️ Webhook já em processamento")
          return NextResponse.json({ received: true, status: "already_processing" })
        }

        if (insertError) {
          console.error("❌ Erro ao registrar webhook:", insertError)
          // Continuar mesmo com erro no registro
        }
      } catch (dbError) {
        console.error("❌ Erro no banco:", dbError)
        // Continuar mesmo com erro no banco
      }
    }

    // 6. VALIDAR ASSINATURA (opcional em modo debug)
    const debugMode = process.env.MERCADOPAGO_WEBHOOK_DEBUG === 'true'
    
    if (!debugMode) {
      try {
        const mpService = new MercadoPagoService()
        const headers = {
          'x-signature': request.headers.get('x-signature') || '',
          'x-request-id': request.headers.get('x-request-id') || ''
        }
        const isValid = mpService.validateWebhookSignature(headers, body)
        
        if (!isValid) {
          console.warn('🚫 Assinatura inválida - rejeitando webhook')
          return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
        }
      } catch (validationError) {
        console.error("❌ Erro na validação:", validationError)
        // Em caso de erro na validação, verificar se está em produção
        if (process.env.NODE_ENV === 'production' && !debugMode) {
          return NextResponse.json({ error: "Validation error" }, { status: 500 })
        }
      }
    } else {
      console.warn('⚠️ MODO DEBUG ATIVO - Aceitando webhook sem validação!')
    }

    console.log('✅ Webhook validado, processando...')

    // 7. PROCESSAR WEBHOOK DE PAGAMENTO
    if (body.type === "payment") {
      const result = await processPayment(body.data.id, db)
      
      // Atualizar status no banco
      if (db && webhookId) {
        try {
          await db
            .from('webhook_events')
            .update({ status: result.success ? 'completed' : 'failed' })
            .eq('webhook_id', webhookId)
        } catch (e) {
          console.error("Erro ao atualizar status:", e)
        }
      }

      console.log(`✅ Webhook processado em ${Date.now() - startTime}ms:`, result)
      return NextResponse.json({ received: true, ...result })
    }

    // 8. OUTROS TIPOS DE WEBHOOK
    console.log("📨 Tipo de webhook não processado:", body.type)
    return NextResponse.json({
      received: true,
      status: "webhook_type_not_processed",
      message: `Tipo ${body.type} não requer processamento`
    })

  } catch (error) {
    console.error("❌ ERRO GERAL NO WEBHOOK:", {
      error: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      webhookId,
      body
    })

    return NextResponse.json({
      error: "Processing error",
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 })
  }
}

/**
 * Processa um pagamento aprovado
 */
async function processPayment(paymentId: string, db: any): Promise<any> {
  try {
    console.log("💰 Processando pagamento:", paymentId)

    // Buscar detalhes do pagamento no MercadoPago
    const mpService = new MercadoPagoService()
    const payment = await mpService.getPayment(paymentId)

    console.log("📋 Detalhes do pagamento:", {
      id: payment.id,
      status: payment.status,
      email: payment.payer?.email,
      amount: payment.transaction_amount,
      externalRef: payment.external_reference
    })

    // Só processar se aprovado
    if (payment.status !== "approved") {
      console.log(`⏳ Pagamento com status ${payment.status}, aguardando...`)
      return {
        success: true,
        status: `payment_${payment.status}`,
        message: `Pagamento com status: ${payment.status}`
      }
    }

    // Validar email
    const userEmail = payment.payer?.email
    if (!userEmail) {
      console.error("❌ Email do pagador não encontrado")
      return { success: false, status: "missing_email", error: "Email não encontrado" }
    }

    // Identificar plano
    let planType = "starter"
    if (payment.metadata?.plan_type) {
      planType = payment.metadata.plan_type
    } else if (payment.external_reference) {
      const [plan] = payment.external_reference.split("_")
      if (["starter", "pro"].includes(plan)) {
        planType = plan
      }
    } else if (payment.transaction_amount >= 100) {
      planType = "pro"
    }

    console.log("🎯 Plano identificado:", planType, "para", userEmail)

    // Ativar plano no banco
    if (!db) {
      console.error("❌ Banco não disponível - não foi possível ativar plano")
      return { 
        success: false, 
        status: "database_unavailable", 
        error: "Banco de dados não configurado" 
      }
    }

    // Buscar usuário
    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('id, email, plan')
      .eq('email', userEmail)
      .single()

    if (profileError || !profile) {
      console.error("❌ Usuário não encontrado:", userEmail, profileError)
      return { success: false, status: "user_not_found", error: "Usuário não encontrado" }
    }

    console.log("👤 Usuário encontrado:", profile.id, "plano atual:", profile.plan)

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 dias

    // Criar/atualizar subscription
    const { data: existingSub } = await db
      .from('subscriptions')
      .select('id')
      .eq('user_id', profile.id)
      .eq('status', 'active')
      .maybeSingle()

    if (existingSub) {
      await db
        .from('subscriptions')
        .update({
          plan_type: planType,
          mercadopago_payment_id: String(payment.id),
          expires_at: expiresAt.toISOString(),
          last_payment_date: payment.date_approved || now.toISOString(),
          last_payment_amount: payment.transaction_amount,
          payment_method: payment.payment_method_id,
          updated_at: now.toISOString()
        })
        .eq('id', existingSub.id)
      
      console.log("✅ Subscription atualizada:", existingSub.id)
    } else {
      const { data: newSub, error: subError } = await db
        .from('subscriptions')
        .insert({
          user_id: profile.id,
          plan_type: planType,
          status: 'active',
          mercadopago_payment_id: String(payment.id),
          started_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          last_payment_date: payment.date_approved || now.toISOString(),
          last_payment_amount: payment.transaction_amount,
          payment_method: payment.payment_method_id,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .select()
        .single()

      if (subError) {
        console.error("❌ Erro ao criar subscription:", subError)
      } else {
        console.log("✅ Subscription criada:", newSub?.id)
      }
    }

    // Atualizar perfil do usuário
    const { error: updateError } = await db
      .from('profiles')
      .update({
        plan: planType,
        subscription_status: 'active',
        last_payment_id: String(payment.id),
        updated_at: now.toISOString()
      })
      .eq('id', profile.id)

    if (updateError) {
      console.error("❌ Erro ao atualizar perfil:", updateError)
      return { success: false, status: "profile_update_failed", error: updateError.message }
    }

    console.log("🎉 PAGAMENTO PROCESSADO COM SUCESSO!", {
      userId: profile.id,
      email: userEmail,
      oldPlan: profile.plan,
      newPlan: planType,
      paymentId: payment.id
    })

    return {
      success: true,
      status: "payment_approved",
      userId: profile.id,
      plan: planType,
      message: `Plano ${planType} ativado com sucesso!`
    }

  } catch (error) {
    console.error("❌ Erro ao processar pagamento:", error)
    return {
      success: false,
      status: "processing_error",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}
