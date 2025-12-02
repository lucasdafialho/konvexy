"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useGenerations } from "@/hooks/use-generations"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  Zap,
  Target,
  BarChart3,
  ArrowUpRight,
  Activity,
  Sparkles,
  Clock,
  Layers3,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, refreshUser, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { used, remaining, limit, planName } = useGenerations()
  const { stats: dashboardStats, isLoading: isLoadingStats, refresh: refreshStats } = useDashboardStats(user?.id)
  const { toast } = useToast()
  const [previousPlan, setPreviousPlan] = useState<string | null>(null)

  // Auto-refresh após pagamento bem-sucedido
  useEffect(() => {
    const subscriptionSuccess = new URLSearchParams(window.location.search).get("subscription")
    if (subscriptionSuccess === "success") {
      localStorage.removeItem("marketpro_pending_payment")

      // Fazer refresh imediato
      refreshUser()

      // Mostrar notificação de processamento
      toast({
        title: "⏳ Processando pagamento...",
        description: "Aguarde enquanto confirmamos seu pagamento. Isso pode levar alguns segundos.",
      })

      // Polling: verificar a cada 3 segundos por 60 segundos
      let attempts = 0
      const maxAttempts = 20 // 20 x 3s = 60s
      const checkInterval = setInterval(async () => {
        attempts++
        console.log(`✅ Verificando atualização do plano... (${attempts}/${maxAttempts})`)

        await refreshUser()

        // Parar se o plano foi atualizado ou após 60 segundos
        if (attempts >= maxAttempts || (user?.plan && user.plan !== 'free')) {
          clearInterval(checkInterval)
          if (user?.plan && user.plan !== 'free') {
            console.log('🎉 Plano atualizado automaticamente!')
            toast({
              title: "🎉 Pagamento confirmado!",
              description: `Seu plano ${user.plan === 'pro' ? 'PRO' : 'STARTER'} foi ativado com sucesso!`,
            })
            // Remover query param da URL
            window.history.replaceState({}, '', '/dashboard')
          } else if (attempts >= maxAttempts) {
            toast({
              title: "⏳ Ainda processando...",
              description: "Seu pagamento está sendo processado. Atualize a página em alguns minutos.",
            })
          }
        }
      }, 3000)

      return () => clearInterval(checkInterval)
    }
  }, [router, refreshUser, user?.plan, toast])

  // Detectar mudança de plano e mostrar notificação
  useEffect(() => {
    if (user?.plan && previousPlan && previousPlan !== user.plan && user.plan !== 'free') {
      toast({
        title: "🎉 Plano atualizado!",
        description: `Seu plano ${user.plan === 'pro' ? 'PRO' : 'STARTER'} está ativo agora!`,
      })
    }
    if (user?.plan) {
      setPreviousPlan(user.plan)
    }
  }, [user?.plan, previousPlan, toast])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const stats = useMemo(() => {
    if (!dashboardStats) {
      return [
        {
          title: "Copies Geradas",
          value: "0",
          change: "",
          changeType: "positive" as const,
          icon: Zap,
          color: "bg-primary",
          comingSoon: false,
        },
        {
          title: "Este Mês",
          value: "0",
          change: "",
          changeType: "positive" as const,
          icon: Activity,
          color: "bg-primary",
          comingSoon: false,
        },
        {
          title: "Ferramentas Usadas",
          value: "0",
          change: "",
          changeType: "positive" as const,
          icon: Layers3,
          color: "bg-primary",
          comingSoon: false,
        },
        {
          title: "Últimos 7 Dias",
          value: "0",
          change: "",
          changeType: "positive" as const,
          icon: TrendingUp,
          color: "bg-primary",
          comingSoon: false,
        },
      ]
    }

    const monthlyChange = dashboardStats.stats.copiesGenerated.change
    const changeDisplay = monthlyChange !== 0 ? `${monthlyChange >= 0 ? '+' : ''}${monthlyChange}%` : ''

    return [
      {
        title: "Total de Copies",
        value: dashboardStats.stats.copiesGenerated.value.toString(),
        change: changeDisplay,
        changeType: dashboardStats.stats.copiesGenerated.changeType,
        icon: Zap,
        color: "bg-primary",
        comingSoon: false,
      },
      {
        title: "Este Mês",
        value: dashboardStats.performance.copiesGenerated.toString(),
        change: "",
        changeType: "positive" as const,
        icon: Activity,
        color: "bg-primary",
        comingSoon: false,
      },
      {
        title: "Ferramentas Usadas",
        value: dashboardStats.stats.productsAnalyzed.value.toString(),
        change: "",
        changeType: "positive" as const,
        icon: Layers3,
        color: "bg-primary",
        comingSoon: false,
      },
      {
        title: "Últimos 7 Dias",
        value: dashboardStats.performance.copiesGenerated.toString(),
        change: "",
        changeType: "positive" as const,
        icon: TrendingUp,
        color: "bg-primary",
        comingSoon: false,
      },
    ]
  }, [dashboardStats])

  const recentActivities = useMemo(() => {
    if (!dashboardStats || !dashboardStats.recentActivities.length) {
      return []
    }

    return dashboardStats.recentActivities.slice(0, 4).map(activity => ({
      action: activity.action,
      description: activity.description,
      time: activity.time,
      type: activity.type,
      icon: getIconForType(activity.type),
    }))
  }, [dashboardStats])

  function getIconForType(type: string) {
    switch (type) {
      case 'copy': return Zap
      case 'ads': return Target
      case 'canvas': return Layers3
      case 'funnel': return BarChart3
      default: return Activity
    }
  }

  const quickActions = [
    {
      title: "Gerar Copy",
      description: "Crie textos persuasivos com IA",
      icon: Zap,
      href: "/dashboard/copy-generator",
      color: "bg-primary",
      textColor: "text-white",
    },
    {
      title: "Nichos em Alta",
      description: "Descubra oportunidades validadas",
      icon: TrendingUp,
      href: "/dashboard/products",
      color: "bg-primary",
      textColor: "text-white",
    },
    {
      title: "Marketing Canvas",
      description: "Crie estratégias completas",
      icon: Layers3,
      href: "/dashboard/canvas",
      color: "bg-primary",
      textColor: "text-white",
    },
  ]

  return (
    <div className="min-h-screen space-y-8 pb-12" data-animate>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-primary/20 p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/30">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              {user?.plan === "pro" && (
                <Badge className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25">
                  PRO
                </Badge>
              )}
              {user?.plan === "starter" && (
                <Badge variant="secondary" className="px-3 py-1 text-xs font-bold bg-primary/20 text-primary border border-primary/30">
                  STARTER
                </Badge>
              )}
              {(!user?.plan || user?.plan === "free") && (
                <Badge variant="outline" className="px-3 py-1 text-xs font-medium border-muted-foreground/50 text-muted-foreground">
                  GRATUITO
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Olá, {user?.name?.split(" ")[0] || "Usuário"} 👋
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl">
              Gerencie suas campanhas de marketing digital e acompanhe seus resultados em tempo real
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/dashboard/copy-generator">
              <Button size="lg" className="shadow-lg shadow-primary/25 font-semibold">
                <Zap className="w-4 h-4 mr-2" />
                Nova Copy
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Card className="bg-card border border-border/50 shadow-sm hover:shadow-md transition-all" data-animate>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Gerações Disponíveis</h3>
                <p className="text-sm text-muted-foreground">
                  {user?.plan === "pro"
                    ? "Acesso ilimitado a todas as ferramentas"
                    : `${remaining} restantes este mês`}
                </p>
              </div>
            </div>
            {user?.plan !== "pro" && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1 max-w-md">
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-medium mb-2">
                    <span className="text-muted-foreground">Uso do mês</span>
                    <span className="text-foreground">{used}/{limit}</span>
                  </div>
                  <Progress value={limit > 0 ? (used / limit) * 100 : 0} className="h-2" />
                </div>
                <Link href="/dashboard/planos">
                  <Button size="sm" variant={remaining === 0 ? "default" : "outline"} className="whitespace-nowrap">
                    {remaining === 0 ? "Liberar Gerações" : "Ver Planos"}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoadingStats ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-card border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                    <div className="w-9 h-9 bg-muted rounded-lg animate-pulse"></div>
                  </div>
                  <div className="h-8 w-16 bg-muted rounded mb-2 animate-pulse"></div>
                  <div className="h-3 w-28 bg-muted rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card
                key={stat.title}
                className={`bg-card border-border/50 hover:border-primary/30 transition-all duration-200 ${stat.comingSoon ? 'opacity-60' : ''}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.comingSoon ? 'bg-muted' : 'bg-primary/10 border border-primary/20'}`}>
                      <Icon className={`h-4 w-4 ${stat.comingSoon ? 'text-muted-foreground' : 'text-primary'}`} />
                    </div>
                  </div>
                  {stat.comingSoon ? (
                    <>
                      <div className="text-xl font-bold text-muted-foreground mb-1">Em breve</div>
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Requer integração</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                      {stat.change && stat.change !== "+0%" && stat.change !== "0%" ? (
                        <div className="flex items-center gap-1 text-xs">
                          <ArrowUpRight className={`h-3 w-3 ${stat.changeType === 'positive' ? 'text-emerald-500' : 'text-red-500'}`} />
                          <span className={`font-semibold ${stat.changeType === 'positive' ? 'text-emerald-500' : 'text-red-500'}`}>{stat.change}</span>
                          <span className="text-muted-foreground">vs mês anterior</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs">
                          <Activity className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Total acumulado</span>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-5">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Ações Rápidas</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            const isDisabled = action.description === "Em breve"
            return (
              <Link 
                key={action.title} 
                href={isDisabled ? "#" : action.href}
                className={isDisabled ? "cursor-not-allowed" : ""}
              >
                <Card
                  className={`bg-card border-border/50 transition-all duration-200 group overflow-hidden h-full ${
                    isDisabled 
                      ? 'opacity-50' 
                      : 'hover:border-primary/30 hover:shadow-md cursor-pointer'
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform ${
                          isDisabled 
                            ? 'bg-muted' 
                            : 'bg-primary/10 border border-primary/20 group-hover:scale-105'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isDisabled ? 'text-muted-foreground' : 'text-primary'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-foreground mb-0.5 ${!isDisabled && 'group-hover:text-primary'} transition-colors`}>
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{action.description}</p>
                      </div>
                      {!isDisabled && (
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold">Atividade Recente</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingStats ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                    <div className="w-9 h-9 bg-muted rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="divide-y divide-border/50">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {activity.time}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
                <Link href="/dashboard/copy-generator">
                  <Button variant="link" size="sm" className="mt-2 text-primary">
                    Gerar sua primeira copy
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50" data-animate>
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold">Performance (7 dias)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            {isLoadingStats ? (
              <div className="space-y-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-4 bg-muted rounded w-12"></div>
                    </div>
                    <div className="h-2 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : dashboardStats ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Copies geradas</span>
                    <span className="font-semibold text-foreground">{dashboardStats.performance.copiesGenerated}</span>
                  </div>
                  <Progress 
                    value={dashboardStats.performance.copiesGenerated > 0 ? Math.min(100, (dashboardStats.performance.copiesGenerated / 30) * 100) : 0} 
                    className="h-2" 
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Taxa de sucesso</span>
                    <span className="font-semibold text-foreground">{dashboardStats.performance.successRate}%</span>
                  </div>
                  <Progress value={dashboardStats.performance.successRate} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Ferramentas usadas</span>
                    <span className="font-semibold text-foreground">{dashboardStats.performance.productsAnalyzed}</span>
                  </div>
                  <Progress 
                    value={dashboardStats.performance.productsAnalyzed > 0 ? Math.min(100, (dashboardStats.performance.productsAnalyzed / 15) * 100) : 0} 
                    className="h-2" 
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 via-background to-primary/10 border border-primary/20 shadow-lg" data-animate>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Dica do Dia</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
            Para maximizar suas conversões, experimente diferentes variações de headlines para o mesmo produto. Nossa IA
            pode gerar múltiplas versões otimizadas que você pode testar.
          </p>
          <Link href="/dashboard/copy-generator">
            <Button className="font-semibold px-6 py-3 bg-primary hover:bg-primary/90">
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Headlines Agora
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
