import { supabase } from './supabase'
import { getSupabaseAdmin } from './supabase-admin'
import { PLANS } from './mercadopago'
import { validateUserPlan } from './subscriptions'

export type GenerationType = 'ads' | 'copy' | 'funnel' | 'canvas'

export interface ToolLimits {
  copy: number
  ads: number
  funnel: number
  canvas: number
}

export interface GenerationLimit {
  plan: 'free' | 'starter' | 'pro'
  allowedTools: GenerationType[]
  limits: ToolLimits
}

// Limites por tipo de ferramenta para cada plano
// Free: apenas copy (5/mês)
// Starter: 100 copy, 50 ads, 20 funnel, 20 canvas
// Pro: todos ilimitados (-1)
export const GENERATION_LIMITS: Record<string, GenerationLimit> = {
  free: {
    plan: 'free',
    allowedTools: ['copy'],
    limits: {
      copy: 5,
      ads: 0,
      funnel: 0,
      canvas: 0
    }
  },
  starter: {
    plan: 'starter',
    allowedTools: ['copy', 'ads', 'funnel', 'canvas'],
    limits: {
      copy: 100,
      ads: 50,
      funnel: 20,
      canvas: 20
    }
  },
  pro: {
    plan: 'pro',
    allowedTools: ['copy', 'ads', 'funnel', 'canvas'],
    limits: {
      copy: -1,
      ads: -1,
      funnel: -1,
      canvas: -1
    }
  }
}

// Mapeamento de nomes de ferramentas para exibição
export const TOOL_DISPLAY_NAMES: Record<GenerationType, string> = {
  copy: 'Gerador de Copy',
  ads: 'Gerador de Estratégias de Ads',
  funnel: 'Gerador de Funis',
  canvas: 'Marketing Model Canvas'
}

export async function checkGenerationLimit(userId: string, type: GenerationType): Promise<{ allowed: boolean; reason?: string; remaining?: number; requiredPlan?: string }> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const currentPlan = await validateUserPlan(userId)
    const planLimits = GENERATION_LIMITS[currentPlan]

    if (!planLimits) {
      return { allowed: false, reason: 'Plano inválido' }
    }

    // VERIFICAÇÃO DE PERMISSÃO POR TIPO DE FERRAMENTA
    // Verifica se o plano atual permite usar esta ferramenta
    if (!planLimits.allowedTools.includes(type)) {
      const toolName = TOOL_DISPLAY_NAMES[type] || type
      
      // Determina qual plano é necessário para esta ferramenta
      let requiredPlan = 'starter'
      if (type === 'copy') {
        requiredPlan = 'free' // Copy está disponível em todos
      }
      
      return { 
        allowed: false, 
        reason: `O ${toolName} requer o plano ${requiredPlan === 'starter' ? 'Starter' : 'Pro'} ou superior. Faça upgrade para desbloquear esta ferramenta.`,
        requiredPlan
      }
    }

    // Pegar o limite específico para este tipo de ferramenta
    const typeLimit = planLimits.limits[type]

    // Se é ilimitado (-1), não verificar contagem
    if (typeLimit === -1) {
      return { allowed: true }
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Contar gerações deste tipo específico no mês
    const { count: monthlyCount } = await supabaseAdmin
      .from('generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('type', type)
      .gte('created_at', startOfMonth.toISOString())

    if ((monthlyCount || 0) >= typeLimit) {
      const toolName = TOOL_DISPLAY_NAMES[type] || type
      return { 
        allowed: false, 
        reason: `Limite mensal de ${typeLimit} gerações de ${toolName} atingido. Faça upgrade para o plano Pro para gerações ilimitadas.`,
        remaining: 0
      }
    }

    const remaining = typeLimit - (monthlyCount || 0)
    return { allowed: true, remaining }

  } catch (error) {
    console.error('Erro ao verificar limite de gerações:', error)
    return { allowed: false, reason: 'Erro ao verificar limites' }
  }
}

export async function incrementGenerationCount(userId: string): Promise<void> {
  // Função desabilitada - a contagem é feita pela inserção na tabela generations
  // O contador generations_used não é mais usado
  return
}

export async function resetMonthlyGenerations(): Promise<void> {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    await supabaseAdmin
      .from('profiles')
      .update({ 
        generations_used: 0,
        updated_at: new Date().toISOString()
      } as any)
      .not('plan', 'eq', 'pro')

    console.log('Contadores mensais resetados com sucesso')
  } catch (error) {
    console.error('Erro ao resetar contadores mensais:', error)
  }
}

export async function getGenerationStats(userId: string): Promise<{
  used: number
  limit: number
  remaining: number
  percentage: number
  plan: string
  byType: Record<GenerationType, { used: number; limit: number; remaining: number }>
}> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, generations_used')
      .eq('id', userId)
      .single()

    if (!profile) {
      throw new Error('Perfil não encontrado')
    }

    const typedProfile = profile as any
    const planLimits = GENERATION_LIMITS[typedProfile.plan]
    
    // Calcular o limite total (soma de todos os limites)
    const isUnlimited = planLimits.limits.copy === -1
    const totalLimit = isUnlimited ? -1 : 
      planLimits.limits.copy + planLimits.limits.ads + planLimits.limits.funnel + planLimits.limits.canvas

    // Buscar uso por tipo no mês atual
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const byType: Record<GenerationType, { used: number; limit: number; remaining: number }> = {
      copy: { used: 0, limit: planLimits.limits.copy, remaining: planLimits.limits.copy },
      ads: { used: 0, limit: planLimits.limits.ads, remaining: planLimits.limits.ads },
      funnel: { used: 0, limit: planLimits.limits.funnel, remaining: planLimits.limits.funnel },
      canvas: { used: 0, limit: planLimits.limits.canvas, remaining: planLimits.limits.canvas }
    }

    // Buscar contagem por tipo
    for (const type of ['copy', 'ads', 'funnel', 'canvas'] as GenerationType[]) {
      const { count } = await supabaseAdmin
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', type)
        .gte('created_at', startOfMonth.toISOString())

      const used = count || 0
      const limit = planLimits.limits[type]
      byType[type] = {
        used,
        limit,
        remaining: limit === -1 ? -1 : Math.max(0, limit - used)
      }
    }

    const totalUsed = byType.copy.used + byType.ads.used + byType.funnel.used + byType.canvas.used

    if (isUnlimited) {
      return {
        used: totalUsed,
        limit: -1,
        remaining: -1,
        percentage: 0,
        plan: typedProfile.plan,
        byType
      }
    }

    const remaining = Math.max(0, totalLimit - totalUsed)
    const percentage = Math.min(100, (totalUsed / totalLimit) * 100)

    return {
      used: totalUsed,
      limit: totalLimit,
      remaining,
      percentage,
      plan: typedProfile.plan,
      byType
    }
  } catch (error) {
    console.error('Erro ao obter estatísticas de geração:', error)
    throw error
  }
}

