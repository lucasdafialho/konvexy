"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Lock, Crown, Sparkles } from "lucide-react"
import Link from "next/link"

interface ToolBlockedModalProps {
  isOpen: boolean
  onClose: () => void
  toolName: string
  requiredPlan: string
  currentPlan: string
}

export function ToolBlockedModal({ isOpen, onClose, toolName, requiredPlan, currentPlan }: ToolBlockedModalProps) {
  if (!isOpen) return null

  const planDisplayName = {
    free: 'Gratuito',
    starter: 'Starter',
    pro: 'Pro'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl animate-in zoom-in-95 duration-200">
        <CardHeader className="relative pb-4">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Ferramenta Bloqueada</CardTitle>
              <CardDescription>
                {toolName} requer upgrade
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              O <strong>{toolName}</strong> está disponível apenas para assinantes do plano{' '}
              <strong>{planDisplayName[requiredPlan as keyof typeof planDisplayName] || requiredPlan}</strong> ou superior.
            </p>
            <p className="text-sm text-muted-foreground">
              Seu plano atual: <strong>{planDisplayName[currentPlan as keyof typeof planDisplayName] || currentPlan}</strong>
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Plano Starter (R$ 49,90/mês)</p>
                <p className="text-muted-foreground">50 gerações/mês + todas as ferramentas</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Crown className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Plano Pro (R$ 149,90/mês)</p>
                <p className="text-muted-foreground">Gerações ilimitadas + suporte prioritário</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
            <p className="text-sm font-medium text-primary mb-1">💡 Dica</p>
            <p className="text-sm text-muted-foreground">
              No plano Gratuito você pode usar o <strong>Gerador de Copy</strong> para criar textos de marketing persuasivos.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Voltar
            </Button>
            <Link href="/dashboard/planos" className="flex-1">
              <Button className="w-full bg-primary hover:bg-primary/90">
                Ver Planos
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

