"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Sparkles, PenTool, Target, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getErrorMessage, isValidEmail, isValidPassword } from "@/lib/error-messages"
import { useCSRF } from "@/hooks/use-csrf"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const { login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setIsLoading(false)
    setError("")
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!email || !password) {
      setError("Por favor, preencha email e senha.")
      setIsLoading(false)
      return
    }

    if (!isValidEmail(email)) {
      setError("Por favor, insira um email valido.")
      setIsLoading(false)
      return
    }

    const passwordValidation = isValidPassword(password)
    if (!passwordValidation.valid) {
      setError(passwordValidation.message || "Senha invalida.")
      setIsLoading(false)
      return
    }

    try {
      await login(email, password)
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('[LOGIN PAGE] Erro no login:', err)
      setError(getErrorMessage(err))
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 relative overflow-hidden">
        {/* Subtle gradient orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-[100px] opacity-60" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/">
            <img
              src="/konvexy/konvexy-logo-transparent.png"
              alt="Konvexy"
              className="h-9 w-auto"
            />
          </Link>

          {/* Center Content */}
          <div className="max-w-lg">
            <h1 className="text-4xl font-bold text-foreground mb-6 leading-tight">
              Marketing inteligente,<br />
              <span className="text-primary">resultados reais.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Acesse sua conta e continue criando conteudo que converte com o poder da inteligencia artificial.
            </p>

            {/* Feature Icons */}
            <div className="mt-12 grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <PenTool className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Copies persuasivas</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Estrategias de Ads</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Funis de vendas</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">IA especializada</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Konvexy. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-6">
          <Link href="/" className="lg:hidden">
            <img
              src="/konvexy/konvexy-logo-transparent.png"
              alt="Konvexy"
              className="h-8 w-auto"
            />
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
          >
            ← Voltar ao site
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-[400px]">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground">Bem-vindo de volta</h2>
              <p className="text-muted-foreground mt-2">
                Entre na sua conta para continuar
              </p>
            </div>

            {/* Google Auth */}
            <GoogleAuthButton mode="signin" className="w-full h-12 rounded-lg" />

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-4 text-sm text-muted-foreground">ou continue com email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-lg pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer">
                  Manter conectado
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-lg text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            {/* Sign Up Link */}
            <p className="mt-8 text-center text-muted-foreground">
              Nao tem uma conta?{" "}
              <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Criar conta gratuita
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
