"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, CheckCircle, X, Zap, Shield, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getErrorMessage, isValidEmail, isValidPassword, isValidName, getPasswordRequirements, getPasswordStrength, getPasswordErrorMessage } from "@/lib/error-messages"
import { EmailConfirmationModal } from "@/components/email-confirmation-modal"
import { useCSRF } from "@/hooks/use-csrf"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isTermsOpen, setIsTermsOpen] = useState(false)
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)

  const { register } = useAuth()
  const router = useRouter()
  const { token: csrfToken, loading: csrfLoading } = useCSRF()

  useEffect(() => {
    setIsLoading(false)
    setError("")
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Por favor, preencha todos os campos.")
      setIsLoading(false)
      return
    }

    const nameValidation = isValidName(formData.name)
    if (!nameValidation.valid) {
      setError(nameValidation.message || "Nome invalido.")
      setIsLoading(false)
      return
    }

    if (!isValidEmail(formData.email)) {
      setError("Por favor, insira um email valido.")
      setIsLoading(false)
      return
    }

    const passwordValidation = isValidPassword(formData.password)
    if (!passwordValidation.valid) {
      setError(passwordValidation.message || "Senha invalida.")
      setIsLoading(false)
      return
    }

    const passwordError = getPasswordErrorMessage(formData.password)
    if (passwordError) {
      setError(passwordError)
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas nao coincidem.")
      setIsLoading(false)
      return
    }

    if (!acceptTerms) {
      setError("Voce deve aceitar os Termos de Uso e a Politica de Privacidade.")
      setIsLoading(false)
      return
    }

    try {
      const result = await register(formData.name, formData.email, formData.password)

      if (result.needsEmailConfirmation) {
        setShowEmailConfirmation(true)
        setIsLoading(false)
      } else {
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push("/dashboard")
      }
    } catch (err) {
      console.error('Erro no registro:', err)
      setError(getErrorMessage(err))
      setIsLoading(false)
    }
  }

  const passwordReqs = getPasswordRequirements(formData.password)
  const passwordStrengthInfo = getPasswordStrength(formData.password)

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
              Transforme ideias em<br />
              <span className="text-primary">conteudo que vende.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              Crie sua conta e comece a gerar copies, estrategias de ads e funis de vendas com inteligencia artificial.
            </p>

            {/* Benefits */}
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Comece gratis</p>
                  <p className="text-sm text-muted-foreground">5 geracoes para testar a plataforma</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Pronto em minutos</p>
                  <p className="text-sm text-muted-foreground">Sem configuracoes complicadas</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Garantia de 7 dias</p>
                  <p className="text-sm text-muted-foreground">Nao gostou? Devolvemos seu dinheiro</p>
                </div>
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
      <div className="flex-1 flex flex-col bg-background overflow-y-auto">
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
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-[400px]">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground">Criar sua conta</h2>
              <p className="text-muted-foreground mt-2">
                Preencha os dados para comecar
              </p>
            </div>

            {/* Google Auth */}
            <GoogleAuthButton mode="signup" className="w-full h-12 rounded-lg" />

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
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-12 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-12 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Crie uma senha"
                    value={formData.password}
                    onChange={handleChange}
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

                {formData.password && (
                  <div className="mt-3 p-4 bg-muted/30 rounded-lg space-y-3">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            passwordStrengthInfo.strength >= level
                              ? passwordStrengthInfo.color
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span className={passwordReqs.minLength ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                        {passwordReqs.minLength ? '✓' : '○'} 8+ caracteres
                      </span>
                      <span className={passwordReqs.hasUpperCase ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                        {passwordReqs.hasUpperCase ? '✓' : '○'} Letra maiuscula
                      </span>
                      <span className={passwordReqs.hasLowerCase ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                        {passwordReqs.hasLowerCase ? '✓' : '○'} Letra minuscula
                      </span>
                      <span className={passwordReqs.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                        {passwordReqs.hasNumber ? '✓' : '○'} Numero
                      </span>
                      <span className={`col-span-2 ${passwordReqs.hasSpecialChar ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                        {passwordReqs.hasSpecialChar ? '✓' : '○'} Caractere especial (!@#$%...)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="h-12 rounded-lg pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1.5 mt-2">
                    <CheckCircle className="w-4 h-4" />
                    Senhas coincidem
                  </p>
                )}
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                  Concordo com os{" "}
                  <button
                    type="button"
                    onClick={() => setIsTermsOpen(true)}
                    className="text-primary hover:underline"
                  >
                    Termos de Uso
                  </button>{" "}
                  e a{" "}
                  <button
                    type="button"
                    onClick={() => setIsPrivacyOpen(true)}
                    className="text-primary hover:underline"
                  >
                    Politica de Privacidade
                  </button>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-lg text-base font-medium"
                disabled={isLoading || csrfLoading}
              >
                {isLoading ? "Criando conta..." : "Criar conta gratuita"}
              </Button>
            </form>

            {/* Login Link */}
            <p className="mt-8 text-center text-muted-foreground">
              Ja tem uma conta?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>

      {showEmailConfirmation && (
        <EmailConfirmationModal
          email={formData.email}
          onClose={() => {
            setShowEmailConfirmation(false)
            router.push("/login")
          }}
        />
      )}

      {isTermsOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsTermsOpen(false)} />
          <div className="relative w-full max-w-2xl">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Termos de Uso</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsTermsOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent className="max-h-[70vh] overflow-y-auto space-y-4 text-sm text-muted-foreground">
                <h3 className="text-foreground font-medium">1. Aceitacao dos Termos</h3>
                <p>Ao criar uma conta e utilizar a Konvexy, voce concorda integralmente com estes Termos de Uso.</p>
                <h3 className="text-foreground font-medium">2. Cadastro e Conta</h3>
                <p>Para acessar os recursos, voce deve fornecer informacoes verdadeiras, precisas e atualizadas.</p>
                <h3 className="text-foreground font-medium">3. Uso Permitido</h3>
                <p>Voce se compromete a utilizar a plataforma de forma licita, respeitando a legislacao aplicavel.</p>
                <h3 className="text-foreground font-medium">4. Planos e Pagamentos</h3>
                <p>Planos pagos podem ser cobrados de forma recorrente. Cancelamentos interrompem cobrancas futuras.</p>
                <h3 className="text-foreground font-medium">5. Propriedade Intelectual</h3>
                <p>Todo o conteudo, marca e tecnologia da Konvexy pertencem a empresa ou a seus licenciadores.</p>
                <h3 className="text-foreground font-medium">6. Conteudos Gerados por IA</h3>
                <p>Os textos gerados sao fornecidos no estado em que se encontram. Voce e responsavel por revisar e adaptar.</p>
                <h3 className="text-foreground font-medium">7. Contato</h3>
                <p>Em caso de duvidas, entre em contato pelo e-mail contato@konvexy.com.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {isPrivacyOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsPrivacyOpen(false)} />
          <div className="relative w-full max-w-2xl">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Politica de Privacidade</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsPrivacyOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent className="max-h-[70vh] overflow-y-auto space-y-4 text-sm text-muted-foreground">
                <h3 className="text-foreground font-medium">1. Introducao</h3>
                <p>Esta Politica descreve como a Konvexy coleta, utiliza e protege seus dados pessoais conforme a LGPD.</p>
                <h3 className="text-foreground font-medium">2. Dados Coletados</h3>
                <p>Coletamos dados de cadastro (nome, email), dados de uso e dados tecnicos (IP, navegador).</p>
                <h3 className="text-foreground font-medium">3. Uso dos Dados</h3>
                <p>Utilizamos para autenticacao, suporte, melhorias na plataforma e fins estatisticos.</p>
                <h3 className="text-foreground font-medium">4. Compartilhamento</h3>
                <p>Compartilhamos apenas com provedores essenciais. Nao vendemos seus dados.</p>
                <h3 className="text-foreground font-medium">5. Seus Direitos</h3>
                <p>Voce pode solicitar acesso, correcao ou exclusao de seus dados a qualquer momento.</p>
                <h3 className="text-foreground font-medium">6. Seguranca</h3>
                <p>Adotamos medidas tecnicas para proteger seus dados contra acessos nao autorizados.</p>
                <h3 className="text-foreground font-medium">7. Contato</h3>
                <p>Para exercer seus direitos, entre em contato pelo e-mail contato@konvexy.com.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
