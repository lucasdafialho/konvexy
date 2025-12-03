"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, CheckCircle2, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { isValidPassword } from "@/lib/error-messages"

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Verifica e processa o token de recuperação da URL
    const checkAndProcessRecoveryToken = async () => {
      try {
        console.log("🔍 [RESET] Iniciando verificação de token...")
        console.log("🔗 [RESET] URL completa:", window.location.href)
        console.log("🔗 [RESET] Hash:", window.location.hash)

        // Aguarda um pouco para garantir que o Supabase processou o hash
        await new Promise(resolve => setTimeout(resolve, 500))

        // Primeiro, verifica se há um hash fragment na URL (Supabase envia o token assim)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')
        const errorParam = hashParams.get('error')
        const errorDescription = hashParams.get('error_description')

        console.log("📝 [RESET] Parâmetros extraídos:", {
          hasAccessToken: !!accessToken,
          accessTokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'null',
          hasRefreshToken: !!refreshToken,
          type,
          error: errorParam,
          errorDescription
        })

        // Verifica se há erro na URL
        if (errorParam) {
          console.error("❌ [RESET] Erro na URL:", errorParam, errorDescription)
          setError(errorDescription || "Link de recuperação inválido ou expirado.")
          return
        }

        // Se há tokens na URL e é um recovery, define a sessão
        if (accessToken && type === 'recovery') {
          console.log("🔄 [RESET] Tipo é recovery, definindo sessão...")

          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          })

          console.log("📊 [RESET] Resposta do setSession:", {
            hasData: !!data,
            hasSession: !!data?.session,
            hasUser: !!data?.user,
            error: error?.message
          })

          if (error) {
            console.error("❌ [RESET] Erro ao definir sessão:", error)
            setError("Não foi possível processar o link de recuperação. Por favor, solicite um novo link.")
            return
          }

          if (data?.session) {
            console.log("✅ [RESET] Sessão de recuperação definida com sucesso!")
            setIsValidSession(true)

            // Limpa o hash da URL para evitar reprocessamento
            window.history.replaceState(null, '', window.location.pathname)
            return
          }
        }

        // Se não há tokens na URL, verifica se já existe uma sessão ativa
        console.log("🔍 [RESET] Verificando sessão existente...")
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        console.log("📊 [RESET] Sessão existente:", {
          hasSession: !!session,
          hasUser: !!session?.user,
          error: sessionError?.message
        })

        if (session) {
          console.log("✅ [RESET] Sessão válida encontrada!")
          setIsValidSession(true)
        } else {
          console.log("❌ [RESET] Nenhuma sessão válida encontrada")
          setError("Link de recuperação inválido ou expirado. Por favor, solicite um novo link.")
        }
      } catch (err: any) {
        console.error("❌ [RESET] Erro ao processar token:", err)
        setError("Ocorreu um erro ao processar o link. Por favor, solicite um novo link.")
      }
    }

    checkAndProcessRecoveryToken()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    // Validações
    if (!newPassword || !confirmPassword) {
      setError("Por favor, preencha todos os campos.")
      setIsLoading(false)
      return
    }

    const passwordValidation = isValidPassword(newPassword)
    if (!passwordValidation.valid) {
      setError(passwordValidation.message || "Senha inválida.")
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.")
      setIsLoading(false)
      return
    }

    try {
      console.log("🔄 [RESET] Iniciando atualização de senha...")

      // Atualiza a senha usando Supabase
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      console.log("📊 [RESET] Resposta do updateUser:", {
        hasData: !!data,
        hasUser: !!data?.user,
        error: updateError?.message
      })

      if (updateError) {
        console.error("❌ [RESET] Erro ao atualizar senha:", updateError)
        throw updateError
      }

      console.log("✅ [RESET] Senha atualizada com sucesso!")
      setSuccess(true)
      setIsLoading(false)

      // Redireciona para o login após 3 segundos
      setTimeout(() => {
        console.log("🔀 [RESET] Redirecionando para login...")
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      console.error("❌ [RESET] Erro ao redefinir senha:", err)
      setError(err.message || "Erro ao redefinir senha. Tente novamente.")
      setIsLoading(false)
    }
  }

  if (!isValidSession && !success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <img src="/konvexy/konvexy-logo.png" alt="Konvexy" className="h-36 w-auto" />
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Link inválido</CardTitle>
              <CardDescription>
                O link de recuperação de senha expirou ou é inválido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/30 rounded-lg mb-4">
                <p>{error}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/forgot-password">
                    Solicitar novo link
                  </Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link href="/login">
                    Voltar ao login
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Voltar para o site
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <img src="/konvexy/konvexy-logo.png" alt="Konvexy" className="h-36 w-auto" />
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Redefinir senha</CardTitle>
            <CardDescription>
              {success
                ? "Senha alterada com sucesso!"
                : "Crie uma nova senha para sua conta"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-6">
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                        Senha redefinida!
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Sua senha foi alterada com sucesso. Você será redirecionado para o login em alguns segundos...
                      </p>
                    </div>
                  </div>
                </div>

                <Button className="w-full" asChild>
                  <Link href="/login">
                    Ir para o login
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-4 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="flex-1">{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="h-11 pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPassword && newPassword.length < 6 && (
                    <p className="text-xs text-destructive">A senha deve ter no mínimo 6 caracteres</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Digite a senha novamente"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11 pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-destructive">As senhas não coincidem</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 6}
                >
                  {isLoading ? "Redefinindo..." : "Redefinir senha"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  )
}
