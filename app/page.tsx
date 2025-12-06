"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Brain,
  BarChart3,
  Shield,
  Users,
  Zap,
  Megaphone,
  Layers3,
  ArrowRight,
  Sparkles,
  Play,
  Star,
  TrendingUp,
  Target,
  ChevronDown,
  MousePointerClick,
  LineChart,
  PenTool,
  Rocket,
  Clock,
  Award,
  Menu,
  X
} from "lucide-react"
import Link from "next/link"
import { ScrollAnimate } from "@/components/scroll-animate"
import { useState, useEffect, useRef } from "react"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <ScrollAnimate />

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass-strong border-b border-white/5 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo - Far Left */}
            <Link href="/" className="flex-shrink-0">
              <img
                src="/konvexy/konvexy-logo-transparent.png"
                alt="Konvexy"
                className="h-9 w-auto"
              />
            </Link>

            {/* Desktop Navigation - Centered with absolute positioning */}
            <nav className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="flex items-center gap-10">
                <a
                  href="#features"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Recursos
                </a>
                <a
                  href="#how-it-works"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Como Funciona
                </a>
                <a
                  href="#pricing"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Preços
                </a>
                <a
                  href="#faq"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </a>
              </div>
            </nav>

            {/* CTA Buttons - Far Right */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button className="btn-glow" size="sm" asChild>
                <Link href="/register">
                  Comecar Gratis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 glass-strong border-b border-white/5 animate-fade-in-scale">
              <div className="px-4 py-6 space-y-1">
                <a
                  href="#features"
                  className="flex items-center px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Recursos
                </a>
                <a
                  href="#how-it-works"
                  className="flex items-center px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Como Funciona
                </a>
                <a
                  href="#pricing"
                  className="flex items-center px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Preços
                </a>
                <a
                  href="#faq"
                  className="flex items-center px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </a>
              </div>
              <div className="px-4 pb-6 pt-2 border-t border-white/5 space-y-3">
                <Button variant="outline" className="w-full justify-center" asChild>
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button className="w-full justify-center btn-glow" asChild>
                  <Link href="/register">
                    Começar Grátis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "2s" }} />

        {/* Floating Elements */}
        <div className="absolute top-32 left-[10%] w-20 h-20 border border-primary/20 rounded-2xl animate-float opacity-30 hidden lg:block" style={{ animationDelay: "0s" }} />
        <div className="absolute top-48 right-[15%] w-16 h-16 border border-purple-500/20 rounded-full animate-float-slow opacity-30 hidden lg:block" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-40 left-[20%] w-12 h-12 bg-primary/10 rounded-lg animate-float opacity-30 hidden lg:block" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-60 right-[10%] w-24 h-24 border border-primary/10 rounded-3xl animate-float-slow opacity-20 hidden lg:block" style={{ animationDelay: "0.5s" }} />

        <div className="container mx-auto relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="reveal mb-8">
            </div>

            {/* Main Headline */}
            <h1 className="reveal stagger-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-[1.1] tracking-tight">
              Transforme Suas
              <span className="block text-gradient-animated mt-2">
                Vendas com IA
              </span>
            </h1>

            {/* Subheadline */}
            <p className="reveal stagger-2 text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Gere copies persuasivas, estratégias de ads e funis de vendas completos em segundos.
              A plataforma de marketing digital que empreendedores sérios usam para escalar.
            </p>

            {/* CTA Buttons */}
            <div className="reveal stagger-3 flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                className="btn-glow text-lg px-8 py-6 glow-primary transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/register">
                  Começar Grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 bg-transparent border-white/10 hover:bg-white/5 transition-all duration-300 hover:scale-105"
              >
                <Play className="w-5 h-5 mr-2" />
                Ver Demonstração
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="reveal stagger-4 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>Dados 100% Seguros</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>Setup em 2 Minutos</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-primary" />
                <span>Garantia de 7 Dias</span>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-gentle">
            <ChevronDown className="w-6 h-6 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-24 px-6 relative overflow-hidden border-y border-white/5">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-card/50 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] opacity-50" />

        <div className="container mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary reveal">
              Por que escolher a Konvexy?
            </Badge>
            <h2 className="reveal text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              A Plataforma que Entende
              <span className="text-gradient block mt-1">o Empreendedor Brasileiro</span>
            </h2>
            <p className="reveal text-lg text-muted-foreground max-w-2xl mx-auto">
              Criamos uma ferramenta pensada nas suas necessidades reais, com tecnologia de ponta e suporte em portugues.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-stagger>
            {/* Card 1 */}
            <div className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1" data-stagger-item>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Geracao Instantanea</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Copies prontas em segundos. Sem espera, sem complicacao. Agilidade para seu negocio.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1" data-stagger-item>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">IA Especializada</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Treinada especificamente para marketing digital e vendas no mercado brasileiro.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1" data-stagger-item>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">100% Brasileiro</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Conteudo em portugues nativo, adaptado a cultura e ao publico do Brasil.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1" data-stagger-item>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Garantia de 7 Dias</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Teste sem risco. Nao gostou? Devolvemos seu dinheiro, sem perguntas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-radial-gradient opacity-50" />

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary reveal">
              Recursos Poderosos
            </Badge>
            <h2 className="reveal text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              Tudo que Você Precisa para
              <span className="text-gradient block mt-2">Vender Mais</span>
            </h2>
            <p className="reveal text-lg text-muted-foreground max-w-2xl mx-auto">
              Ferramentas de IA desenvolvidas especificamente para marketing digital e vendas online.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-stagger>
            {/* Feature Card 1 */}
            <Card className="group card-hover border-white/5 bg-card/50 backdrop-blur-sm overflow-hidden" data-stagger-item>
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Gerador de Copy IA</h3>
                <p className="text-muted-foreground mb-6">
                  Crie headlines, e-mails, posts e anúncios persuasivos em segundos com IA treinada em marketing.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>5 tipos de copy</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Múltiplos tons de voz</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Geração instantânea</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature Card 2 */}
            <Card className="group card-hover border-white/5 bg-card/50 backdrop-blur-sm overflow-hidden" data-stagger-item>
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Megaphone className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Estratégias de Ads</h3>
                <p className="text-muted-foreground mb-6">
                  Planeje campanhas completas para Meta Ads e Google Ads com segmentação e criativos prontos.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Meta & Google Ads</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Segmentação sugerida</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Criativos inclusos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature Card 3 */}
            <Card className="group card-hover border-white/5 bg-card/50 backdrop-blur-sm overflow-hidden" data-stagger-item>
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Layers3 className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Funis de Vendas</h3>
                <p className="text-muted-foreground mb-6">
                  Gere funis completos com páginas, e-mails e sequências de follow-up automatizadas.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Funis de 5 a 7 etapas</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>E-mails inclusos</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Automação sugerida</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature Card 4 */}
            <Card className="group card-hover border-white/5 bg-card/50 backdrop-blur-sm overflow-hidden" data-stagger-item>
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Nichos em Alta</h3>
                <p className="text-muted-foreground mb-6">
                  Descubra nichos validados com alta demanda e baixa concorrência para maximizar lucros.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Análise de demanda</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Score de potencial</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Atualização mensal</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature Card 5 */}
            <Card className="group card-hover border-white/5 bg-card/50 backdrop-blur-sm overflow-hidden" data-stagger-item>
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <PenTool className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Marketing Canvas</h3>
                <p className="text-muted-foreground mb-6">
                  Visualize toda sua estratégia de marketing em um canvas interativo e organizado.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Visão completa</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Exportável</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Colaborativo</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature Card 6 */}
            <Card className="group card-hover border-white/5 bg-card/50 backdrop-blur-sm overflow-hidden" data-stagger-item>
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <LineChart className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Analytics Avançado</h3>
                <p className="text-muted-foreground mb-6">
                  Acompanhe o desempenho das suas gerações e otimize seus resultados com dados.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Métricas detalhadas</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Histórico completo</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Insights de uso</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 px-6 bg-card/30 border-y border-white/5">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary reveal">
              Simples e Rápido
            </Badge>
            <h2 className="reveal text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              Como Funciona
            </h2>
            <p className="reveal text-lg text-muted-foreground max-w-2xl mx-auto">
              Comece a gerar conteúdo de alta conversão em menos de 2 minutos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto" data-stagger>
            {/* Step 1 */}
            <div className="relative text-center" data-stagger-item>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Crie sua Conta</h3>
              <p className="text-muted-foreground">
                Cadastre-se gratuitamente e acesse o dashboard em segundos.
              </p>
              {/* Connector */}
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/50 to-transparent" />
            </div>

            {/* Step 2 */}
            <div className="relative text-center" data-stagger-item>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Escolha a Ferramenta</h3>
              <p className="text-muted-foreground">
                Selecione entre Copy, Ads, Funis ou Canvas conforme sua necessidade.
              </p>
              {/* Connector */}
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/50 to-transparent" />
            </div>

            {/* Step 3 */}
            <div className="text-center" data-stagger-item>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Gere e Use</h3>
              <p className="text-muted-foreground">
                Preencha os campos, clique em gerar e copie o resultado pronto para usar.
              </p>
            </div>
          </div>

          <div className="text-center mt-16 reveal">
            <Button size="lg" className="btn-glow" asChild>
              <Link href="/register">
                Começar Agora
                <Rocket className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient opacity-30" />

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary reveal">
              Resultados Reais
            </Badge>
            <h2 className="reveal text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              O que Nossos Clientes Dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6" data-stagger>
            {/* Testimonial 1 */}
            <Card className="border-white/5 bg-card/50 backdrop-blur-sm" data-stagger-item>
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">
                  "A Konvexy revolucionou minha forma de criar conteúdo. O que antes levava horas, agora faço em minutos. Minhas conversões aumentaram 40%."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center font-semibold">
                    M
                  </div>
                  <div>
                    <p className="font-medium">Marina Costa</p>
                    <p className="text-sm text-muted-foreground">Infoprodutora</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-white/5 bg-card/50 backdrop-blur-sm" data-stagger-item>
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">
                  "Finalmente uma ferramenta que entende marketing digital brasileiro. As copies saem prontas para usar, com tom perfeito para meu público."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center font-semibold">
                    R
                  </div>
                  <div>
                    <p className="font-medium">Ricardo Souza</p>
                    <p className="text-sm text-muted-foreground">Gestor de Tráfego</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border-white/5 bg-card/50 backdrop-blur-sm" data-stagger-item>
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">
                  "O gerador de funis é incrível! Economizo horas de planejamento e tenho uma estrutura completa para lançamentos em minutos."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center font-semibold">
                    A
                  </div>
                  <div>
                    <p className="font-medium">Ana Beatriz</p>
                    <p className="text-sm text-muted-foreground">Mentora Digital</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary reveal">
              Precos Transparentes
            </Badge>
            <h2 className="reveal text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              Escolha o Plano
              <span className="text-gradient block mt-2">Ideal para Voce</span>
            </h2>
            <p className="reveal text-lg text-muted-foreground max-w-2xl mx-auto">
              Comece gratis e faca upgrade quando quiser. Cancele a qualquer momento.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch" data-stagger>
            {/* Free Plan */}
            <div className="group relative" data-stagger-item>
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative h-full p-8 rounded-3xl border border-white/10 bg-card/30 backdrop-blur-sm hover:border-white/20 transition-all duration-300 flex flex-col">
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Gratuito</h3>
                  <p className="text-sm text-muted-foreground">Para experimentar a plataforma</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold tracking-tight">R$0</span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Para sempre</p>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">5 copies por mes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">Gerador de Copy</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">Suporte por e-mail</span>
                  </li>
                </ul>

                <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 hover:border-white/20 hover:bg-white/5" asChild>
                  <Link href="/register">Comecar Gratis</Link>
                </Button>
              </div>
            </div>

            {/* Pro Plan - Featured */}
            <div className="group relative md:-mt-4 md:mb-4" data-stagger-item>
              {/* Glow effect */}
              <div className="absolute -inset-[1px] bg-gradient-to-b from-primary via-primary/50 to-purple-500/50 rounded-3xl opacity-100 blur-sm" />
              <div className="absolute -inset-[1px] bg-gradient-to-b from-primary via-primary/50 to-purple-500/50 rounded-3xl" />

              <div className="relative h-full p-8 rounded-3xl bg-gradient-to-b from-card to-card/80 backdrop-blur-sm flex flex-col">
                {/* Popular badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-primary to-purple-500 text-white px-4 py-1.5 text-xs font-semibold shadow-lg shadow-primary/25 border-0">
                    Mais Popular
                  </Badge>
                </div>

                <div className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-primary/25">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Pro</h3>
                  <p className="text-sm text-muted-foreground">Para profissionais serios</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold tracking-tight text-gradient">R$149</span>
                    <span className="text-muted-foreground">,90/mes</span>
                  </div>
                  <p className="text-sm text-primary mt-2">Tudo ilimitado</p>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Geracoes ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">Todas as ferramentas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">Suporte prioritario</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">Novidades em primeira mao</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">Templates exclusivos</span>
                  </li>
                </ul>

                <Button className="w-full h-12 rounded-xl btn-glow text-base font-semibold" asChild>
                  <Link href="/register">
                    Assinar Pro
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Starter Plan */}
            <div className="group relative" data-stagger-item>
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative h-full p-8 rounded-3xl border border-white/10 bg-card/30 backdrop-blur-sm hover:border-white/20 transition-all duration-300 flex flex-col">
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Starter</h3>
                  <p className="text-sm text-muted-foreground">Para empreendedores</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold tracking-tight">R$49</span>
                    <span className="text-muted-foreground">,90/mes</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Cobrado mensalmente</p>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">100 copies por mes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">50 estrategias de Ads</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">20 funis de vendas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">20 Marketing Canvas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">Nichos em alta</span>
                  </li>
                </ul>

                <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 hover:border-white/20 hover:bg-white/5" asChild>
                  <Link href="/register">Assinar Starter</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Guarantee */}
          <div className="text-center mt-16 reveal">
            <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Garantia de 7 dias</p>
                <p className="text-sm text-muted-foreground">Nao gostou? Devolvemos seu dinheiro.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary reveal">
              Dúvidas Frequentes
            </Badge>
            <h2 className="reveal text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="space-y-4" data-stagger>
            <FAQItem
              question="Posso testar antes de assinar?"
              answer="Sim! Oferecemos um plano gratuito com 5 gerações por mês para você experimentar a plataforma sem compromisso."
            />
            <FAQItem
              question="Como funciona a garantia de 7 dias?"
              answer="Se você não ficar satisfeito com a plataforma nos primeiros 7 dias após a assinatura, devolvemos 100% do seu dinheiro. Sem perguntas."
            />
            <FAQItem
              question="Posso cancelar a qualquer momento?"
              answer="Sim, você pode cancelar sua assinatura a qualquer momento diretamente no painel. Não há fidelidade ou multas."
            />
            <FAQItem
              question="A IA gera conteúdo em português brasileiro?"
              answer="Sim! Nossa IA foi treinada especificamente para o mercado brasileiro, gerando conteúdo natural e adaptado ao nosso público."
            />
            <FAQItem
              question="Preciso de conhecimento técnico?"
              answer="Não. A plataforma foi criada para ser simples. Basta preencher alguns campos e clicar em gerar. Qualquer pessoa consegue usar."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] opacity-50" />

        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="reveal text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              Pronto para
              <span className="text-gradient block mt-2">Escalar suas Vendas?</span>
            </h2>
            <p className="reveal text-lg text-muted-foreground mb-10">
              Junte-se a centenas de empreendedores que já usam IA para criar conteúdo de alta conversão.
            </p>
            <div className="reveal flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="btn-glow text-lg px-10 py-6 glow-primary"
                asChild
              >
                <Link href="/register">
                  Começar Grátis Agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
            <p className="reveal text-sm text-muted-foreground mt-6">
              Sem cartão de crédito. Comece em 2 minutos.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative pt-20 pb-8 px-6 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-background" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[400px] bg-primary/5 rounded-full blur-[150px]" />

        <div className="container mx-auto relative z-10">
          {/* Top Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-white/5">
            {/* Brand Column */}
            <div className="lg:col-span-5">
              <Link href="/" className="inline-block mb-6">
                <img
                  src="/konvexy/konvexy-logo-transparent.png"
                  alt="Konvexy"
                  className="h-10 w-auto"
                />
              </Link>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
                Plataforma de marketing digital com IA para empreendedores que querem escalar suas vendas online de forma inteligente.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="btn-glow" asChild>
                  <Link href="/register">
                    Comecar Gratis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" className="border-white/10 hover:border-white/20" asChild>
                  <Link href="/login">Fazer Login</Link>
                </Button>
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {/* Platform Column */}
                <div>
                  <h4 className="font-semibold text-foreground mb-6">Plataforma</h4>
                  <ul className="space-y-4">
                    <li>
                      <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
                        <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        Recursos
                      </a>
                    </li>
                    <li>
                      <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
                        <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        Precos
                      </a>
                    </li>
                    <li>
                      <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
                        <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        Como Funciona
                      </a>
                    </li>
                    <li>
                      <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
                        <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        FAQ
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Legal Column */}
                <div>
                  <h4 className="font-semibold text-foreground mb-6">Legal</h4>
                  <ul className="space-y-4">
                    <li>
                      <Link href="/legal/termos" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
                        <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        Termos de Uso
                      </Link>
                    </li>
                    <li>
                      <Link href="/legal/privacidade" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
                        <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        Privacidade
                      </Link>
                    </li>
                    <li>
                      <Link href="/legal/reembolso" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
                        <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        Reembolso
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Contact Column */}
                <div>
                  <h4 className="font-semibold text-foreground mb-6">Contato</h4>
                  <ul className="space-y-4">
                    <li>
                      <a href="mailto:contato@konvexy.com" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
                        <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        contato@konvexy.com
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">Todos os sistemas operacionais</span>
              </div>

              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Konvexy. Todos os direitos reservados.
              </p>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Feito com</span>
                <span className="text-red-500">❤</span>
                <span>no Brasil</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className="border border-white/10 rounded-xl overflow-hidden bg-card/30 backdrop-blur-sm"
      data-stagger-item
    >
      <button
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-muted-foreground">{answer}</p>
        </div>
      </div>
    </div>
  )
}
