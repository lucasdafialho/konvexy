"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./use-auth"
import { PLANS } from "@/lib/mercadopago"
import { supabase } from "@/lib/supabase"

// Tipos de geração disponíveis
export type GenerationType = 'ads' | 'copy' | 'funnel' | 'canvas'

// Ferramentas permitidas por plano
// Free: apenas copy
// Starter: todos os geradores (copy, ads, funnel, canvas)
// Pro: todos ilimitados
const ALLOWED_TOOLS: Record<string, GenerationType[]> = {
  free: ['copy'],
  starter: ['copy', 'ads', 'funnel', 'canvas'],
  pro: ['copy', 'ads', 'funnel', 'canvas']
}

// Limites por tipo de ferramenta para cada plano
export const TOOL_LIMITS: Record<string, Record<GenerationType, number>> = {
  free: { copy: 5, ads: 0, funnel: 0, canvas: 0 },
  starter: { copy: 100, ads: 50, funnel: 20, canvas: 20 },
  pro: { copy: -1, ads: -1, funnel: -1, canvas: -1 }
}

// Nomes amigáveis das ferramentas
export const TOOL_NAMES: Record<GenerationType, string> = {
  copy: 'Gerador de Copy',
  ads: 'Gerador de Estratégias de Ads',
  funnel: 'Gerador de Funis',
  canvas: 'Marketing Model Canvas'
}

export function useGenerations() {
  const { user, refreshUser } = useAuth()
  const [generationsUsed, setGenerationsUsed] = useState(0)

  useEffect(() => {
    if (user) {
      setGenerationsUsed(user.generationsUsed || 0)
    }
  }, [user])

  const getGenerationLimit = () => {
    if (!user) return 0
    const planType = user.plan as "free" | "starter" | "pro"
    return PLANS[planType]?.limit || 0
  }

  const getRemainingGenerations = () => {
    const limit = getGenerationLimit()
    if (limit === -1) return -1
    return Math.max(0, limit - generationsUsed)
  }

  const canGenerate = () => {
    const remaining = getRemainingGenerations()
    return remaining === -1 || remaining > 0
  }

  // Verifica se uma ferramenta específica é permitida para o plano do usuário
  const isToolAllowed = useCallback((tool: GenerationType): boolean => {
    if (!user) return false
    const planType = user.plan as "free" | "starter" | "pro"
    const allowedTools = ALLOWED_TOOLS[planType] || []
    return allowedTools.includes(tool)
  }, [user])

  // Retorna o plano mínimo necessário para usar uma ferramenta
  const getRequiredPlanForTool = useCallback((tool: GenerationType): string => {
    if (ALLOWED_TOOLS.free.includes(tool)) return 'free'
    if (ALLOWED_TOOLS.starter.includes(tool)) return 'starter'
    return 'pro'
  }, [])

  // Retorna lista de ferramentas permitidas para o plano atual
  const getAllowedTools = useCallback((): GenerationType[] => {
    if (!user) return []
    const planType = user.plan as "free" | "starter" | "pro"
    return ALLOWED_TOOLS[planType] || []
  }, [user])

  // Retorna o limite de uma ferramenta específica para o plano atual
  const getToolLimit = useCallback((tool: GenerationType): number => {
    if (!user) return 0
    const planType = user.plan as "free" | "starter" | "pro"
    return TOOL_LIMITS[planType]?.[tool] || 0
  }, [user])

  const incrementGenerations = async () => {
    if (!user) return

    const next = generationsUsed + 1
    
    // Atualizar no Supabase
    const { error } = await supabase
      .from('profiles')
      .update({ generations_used: next })
      .eq('id', user.id)

    if (error) {
      console.error('Erro ao incrementar gerações:', error)
      return
    }

    setGenerationsUsed(next)
    await refreshUser()
  }

  const resetGenerations = async () => {
    if (!user) return

    // Atualizar no Supabase
    const { error } = await supabase
      .from('profiles')
      .update({ generations_used: 0 })
      .eq('id', user.id)

    if (error) {
      console.error('Erro ao resetar gerações:', error)
      return
    }

    setGenerationsUsed(0)
    await refreshUser()
  }

  return {
    limit: getGenerationLimit(),
    used: generationsUsed,
    remaining: getRemainingGenerations(),
    canGenerate: canGenerate(),
    incrementGenerations,
    resetGenerations,
    planName: user?.plan || "free",
    // Funções para verificação de ferramentas
    isToolAllowed,
    getRequiredPlanForTool,
    getAllowedTools,
    getToolLimit,
  }
}

