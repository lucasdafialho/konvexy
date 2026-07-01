"use client"

import { useState, useEffect, Suspense } from "react"
import { useCSRF } from "@/hooks/use-csrf"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Crown, Loader2, Sparkles, Shield, TrendingUp, PartyPopper, ExternalLink } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { PLANS } from "@/lib/plans"
import { useSearchParams, useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

function SearchParamsEffect({ onPaymentSuccess }: { onPaymentSuccess: () => void }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const paymentSuccess = searchParams.get("payment")
    const sessionId = searchParams.get("session_id")

    if (paymentSuccess === "success" && sessionId) {
      onPaymentSuccess()
    }
  }, [searchParams, onPaymentSuccess])

  return null
}

export default function PlanosPage() {
  const { user, isLoading: authLoading, refreshUser } = useAuth()
  const { token: csrfToken } = useCSRF()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [approvedPlan, setApprovedPlan] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/dashboard/planos")
    }
  }, [user, authLoading, router])

  const handlePaymentSuccess = async () => {
    setShowSuccessModal(true)
    setApprovedPlan(user?.plan || 'starter')
    await refreshUser()
    window.history.replaceState({}, '', '/dashboard/planos')
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    router.push("/dashboard")
  }

  const handleSelectPlan = async (planType: "starter" | "pro") => {
    if (!user?.email) {
      alert("Você precisa estar logado para assinar um plano")
      return
    }

    if (!csrfToken) {
      alert("Token de segurança não disponível. Recarregue a página.")
      return
    }

    setLoading(planType)

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          planType,
          userEmail: user.email,
          userName: user.name,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao processar pagamento")
      }

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        throw new Error("Link de pagamento não encontrado")
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error)
      alert("Erro ao processar seu pagamento. Tente novamente.")
    } finally {
      setLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    if (!user?.email) return
    if (!csrfToken) {
      alert("Token de segurança não disponível. Recarregue a página.")
      return
    }
    setPortalLoading(true)

    try {
      const response = await fetch("/api/stripe/customer-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Erro ao abrir portal")
      }

      const { url } = await response.json()
      if (url) window.location.href = url
    } catch (error) {
      console.error("Erro ao abrir portal:", error)
      alert("Erro ao abrir portal de assinatura. Tente novamente.")
    } finally {
      setPortalLoading(false)
    }
  }

  const plans = [
    {
      id: "starter",
      name: PLANS.starter.name,
      price: PLANS.starter.price,
      description: "Ideal para começar com marketing digital",
      features: PLANS.starter.features,
      icon: Zap,
      color: "bg-primary/10",
      iconColor: "text-primary",
      buttonVariant: "outline" as const,
      popular: false,
    },
    {
      id: "pro",
      name: PLANS.pro.name,
      price: PLANS.pro.price,
      description: "Para profissionais que querem resultados máximos",
      features: PLANS.pro.features,
      icon: Crown,
      color: "bg-primary",
      iconColor: "text-white",
      buttonVariant: "default" as const,
      popular: true,
    },
  ]

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  const hasPaidPlan = user.plan === "starter" || user.plan === "pro"

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10" data-animate>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Suspense>
          <SearchParamsEffect onPaymentSuccess={handlePaymentSuccess} />
        </Suspense>

        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center justify-center">
            <Badge className="px-4 py-2 text-sm font-medium" variant="secondary">
              <TrendingUp className="w-4 h-4 mr-2" />
              Planos mensais flexíveis
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight">
            Escolha seu Plano
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transforme seu marketing digital com o poder da inteligência artificial.<br />
            Cancele quando quiser, sem compromisso.
          </p>
        </div>

        {hasPaidPlan && (
          <div className="max-w-5xl mx-auto mb-8">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="font-semibold text-foreground">
                    Plano atual: <span className="text-primary">{user.plan === 'pro' ? 'Pro' : 'Starter'}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Gerencie, cancele ou troque de plano pelo portal de assinatura.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="shrink-0"
                >
                  {portalLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Gerenciar assinatura
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto px-4">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isCurrentPlan = user?.plan === plan.id
            const isLoadingPlan = loading === plan.id

            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.02] group flex flex-col ${
                  plan.popular
                    ? "border-2 border-primary shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(139,92,246,0.25)] bg-gradient-to-br from-background via-background to-primary/5"
                    : "border-2 border-border/50 hover:border-primary/50 shadow-lg hover:shadow-xl"
                }`}
                data-animate
              >
                {plan.popular && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary/80 to-primary" />
                    <div className="absolute top-5 right-5 z-10">
                      <Badge className="bg-gradient-to-r from-primary to-primary/80 border-0 shadow-lg px-3 py-1.5 text-xs font-bold">
                        <Crown className="w-3.5 h-3.5 mr-1.5" />
                        Mais Popular
                      </Badge>
                    </div>
                  </>
                )}

                <CardHeader className="text-center pb-4 pt-6 space-y-3">
                  <div className="space-y-3">
                    <div className={`w-14 h-14 ${plan.color} rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <Icon className={`w-7 h-7 ${plan.iconColor}`} />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">{plan.description}</CardDescription>
                    </div>
                  </div>

                  <div className="pt-1">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-sm text-muted-foreground font-semibold">R$</span>
                      <span className="text-4xl font-extrabold bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                        {plan.price.toFixed(2).split('.')[0]}
                      </span>
                      <div className="flex flex-col items-start">
                        <span className="text-base font-bold text-foreground">,{plan.price.toFixed(2).split('.')[1]}</span>
                        <span className="text-xs text-muted-foreground font-medium">/mês</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 flex flex-col flex-1 px-5 pb-5">
                  <ul className="space-y-2 flex-grow">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2.5 group/item">
                        <div className="w-4 h-4 bg-gradient-to-br from-primary via-primary to-primary/70 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md group-hover/item:scale-110 transition-transform">
                          <Check className="w-2.5 h-2.5 text-white font-bold stroke-[3]" />
                        </div>
                        <span className="text-foreground text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-3 border-t border-border mt-auto">
                    {isCurrentPlan ? (
                      <Badge className="w-full justify-center py-2.5 h-11 text-sm font-bold" variant="secondary">
                        <Check className="w-4 h-4 mr-2" />
                        Plano Atual
                      </Badge>
                    ) : (
                      <Button
                        className={`w-full h-12 text-base font-bold shadow-xl hover:shadow-2xl transition-all duration-300 ${
                          plan.popular
                            ? "bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary text-white"
                            : ""
                        }`}
                        variant={plan.buttonVariant}
                        onClick={() => handleSelectPlan(plan.id as "starter" | "pro")}
                        disabled={isLoadingPlan}
                      >
                        {isLoadingPlan ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Redirecionando...
                          </>
                        ) : (
                          <>
                            Assinar {plan.name}
                            <Sparkles className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="max-w-4xl mx-auto space-y-6 mt-10" data-animate>
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 shadow-xl">
            <CardHeader className="text-center pb-4 pt-8 space-y-3">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-foreground">
                Métodos de Pagamento Aceitos
              </CardTitle>
              <CardDescription className="text-sm">
                Pagamento 100% seguro via Stripe — aceitamos cartões e métodos locais
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex flex-col items-center p-4 bg-background rounded-xl border-2 border-primary/30 hover:border-primary hover:shadow-lg transition-all group cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-foreground text-center">Visa / Master</span>
                  <p className="text-xs text-muted-foreground mt-1 text-center">Crédito e débito</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-background rounded-xl border-2 border-primary/30 hover:border-primary hover:shadow-lg transition-all group cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-foreground text-center">American Express</span>
                  <p className="text-xs text-muted-foreground mt-1 text-center">Crédito</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-background rounded-xl border-2 border-primary/30 hover:border-primary hover:shadow-lg transition-all group cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-foreground text-center">PIX</span>
                  <p className="text-xs text-muted-foreground mt-1 text-center">Instantâneo</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-background rounded-xl border-2 border-primary/30 hover:border-primary hover:shadow-lg transition-all group cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-foreground text-center">Boleto</span>
                  <p className="text-xs text-muted-foreground mt-1 text-center">Bancário</p>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/30">
                <p className="text-sm text-center leading-relaxed">
                  <span className="inline-flex items-center gap-2 text-primary font-bold">
                    <Shield className="w-4 h-4" />
                    Pagamento 100% Seguro via Stripe
                  </span>
                  <br />
                  <span className="text-muted-foreground text-xs mt-1 block">
                    Stripe é usado por milhões de empresas no mundo. Seus dados são protegidos com criptografia de ponta a ponta.
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/50 to-background border-2 border-border shadow-xl">
            <CardHeader className="text-center pb-4 pt-8 space-y-2">
              <CardTitle className="text-xl font-bold text-foreground">Perguntas Frequentes</CardTitle>
              <CardDescription className="text-sm">Tire suas dúvidas sobre nossos planos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <div className="bg-background p-4 rounded-xl border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold text-foreground mb-2 text-sm flex items-center gap-2">
                  <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  Posso cancelar a qualquer momento?
                </h4>
                <p className="text-muted-foreground text-xs leading-relaxed ml-7">
                  Sim! Cancele direto no portal de assinatura, sem multas. Seu plano fica ativo até o fim do período pago.
                </p>
              </div>
              <div className="bg-background p-4 rounded-xl border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold text-foreground mb-2 text-sm flex items-center gap-2">
                  <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  Como funciona a cobrança?
                </h4>
                <p className="text-muted-foreground text-xs leading-relaxed ml-7">
                  Cobrança mensal automática via Stripe. Você pode trocar o método de pagamento ou cancelar a qualquer hora no portal.
                </p>
              </div>
              <div className="bg-background p-4 rounded-xl border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold text-foreground mb-2 text-sm flex items-center gap-2">
                  <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  Quais métodos de pagamento são aceitos?
                </h4>
                <p className="text-muted-foreground text-xs leading-relaxed ml-7">
                  Aceitamos Visa, Mastercard, American Express, PIX e Boleto via Stripe. Novos métodos são adicionados automaticamente.
                </p>
              </div>
              <div className="bg-background p-4 rounded-xl border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold text-foreground mb-2 text-sm flex items-center gap-2">
                  <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-3 h-3 text-primary" />
                  </div>
                  O pagamento é seguro?
                </h4>
                <p className="text-muted-foreground text-xs leading-relaxed ml-7">
                  100% seguro! Stripe processa pagamentos de empresas como Amazon e Shopify. Nenhum dado de cartão passa pelos nossos servidores.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <PartyPopper className="w-10 h-10 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                🎉 Pagamento Confirmado!
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                Obrigado por assinar o plano{" "}
                <span className="font-bold text-primary">
                  {approvedPlan === 'pro' ? 'Pro' : 'Starter'}
                </span>!
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-xl border border-primary/20">
              <p className="text-center text-foreground">
                Sua assinatura está <span className="font-bold text-green-500">ativa</span>!
                Agora você tem acesso a todos os recursos do plano.
              </p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Acesso liberado imediatamente</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Renovação automática mensal via Stripe</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Cancele quando quiser pelo portal</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleCloseSuccessModal}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white font-bold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Começar a usar agora!
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Aproveite sua assinatura e crie copies incríveis! 🚀
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
