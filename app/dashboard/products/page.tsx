"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Flame,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Heart,
  Zap,
  Target,
  Clock,
  Users,
  ArrowRight,
  Sparkles,
  Crown,
  CheckCircle2,
  ExternalLink,
  Filter,
  X
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

interface Product {
  id: string
  title: string
  category: string
  description: string
  demandScore: number
  competitionLevel: "low" | "medium" | "high"
  priceRange: string
  monthlySearches: number
  profitPotential: "low" | "medium" | "high" | "very-high"
  trend: "up" | "down" | "stable"
  tags: string[]
  validationScore: number
  timeToMarket: string
  targetAudience: string
  keyBenefits: string[]
  marketSize: string
  hotLevel?: number
}

const mockProducts: Product[] = [
  {
    id: "1",
    title: "Curso de Dropshipping para Iniciantes",
    category: "E-commerce",
    description: "Curso completo sobre como começar no dropshipping sem investimento inicial",
    demandScore: 92,
    competitionLevel: "medium",
    priceRange: "R$ 197 - R$ 497",
    monthlySearches: 45000,
    profitPotential: "very-high",
    trend: "up",
    tags: ["dropshipping", "e-commerce", "iniciantes", "renda extra"],
    validationScore: 88,
    timeToMarket: "2-3 semanas",
    targetAudience: "Pessoas buscando renda extra online",
    keyBenefits: ["Baixo investimento inicial", "Mercado em crescimento", "Alta demanda"],
    marketSize: "R$ 2.3M/mês",
    hotLevel: 5,
  },
  {
    id: "2",
    title: "Método de Organização Pessoal",
    category: "Produtividade",
    description: "Sistema completo para organizar vida pessoal e profissional",
    demandScore: 78,
    competitionLevel: "low",
    priceRange: "R$ 97 - R$ 297",
    monthlySearches: 28000,
    profitPotential: "high",
    trend: "up",
    tags: ["produtividade", "organização", "lifestyle", "bem-estar"],
    validationScore: 85,
    timeToMarket: "1-2 semanas",
    targetAudience: "Profissionais sobrecarregados",
    keyBenefits: ["Baixa concorrência", "Nicho evergreen", "Fácil produção"],
    marketSize: "R$ 890K/mês",
    hotLevel: 4,
  },
  {
    id: "3",
    title: "Curso de Investimentos em Criptomoedas",
    category: "Finanças",
    description: "Guia completo para investir em criptomoedas com segurança",
    demandScore: 95,
    competitionLevel: "high",
    priceRange: "R$ 297 - R$ 997",
    monthlySearches: 67000,
    profitPotential: "very-high",
    trend: "up",
    tags: ["criptomoedas", "investimentos", "bitcoin", "finanças"],
    validationScore: 91,
    timeToMarket: "3-4 semanas",
    targetAudience: "Investidores iniciantes e intermediários",
    keyBenefits: ["Altíssima demanda", "Tickets altos", "Mercado aquecido"],
    marketSize: "R$ 4.2M/mês",
    hotLevel: 5,
  },
  {
    id: "4",
    title: "Receitas Fitness Low Carb",
    category: "Saúde",
    description: "E-book com 100+ receitas saudáveis e saborosas",
    demandScore: 71,
    competitionLevel: "medium",
    priceRange: "R$ 47 - R$ 147",
    monthlySearches: 35000,
    profitPotential: "medium",
    trend: "stable",
    tags: ["fitness", "receitas", "low-carb", "emagrecimento"],
    validationScore: 76,
    timeToMarket: "1 semana",
    targetAudience: "Pessoas em dieta e atletas",
    keyBenefits: ["Produção rápida", "Nicho fiel", "Baixo custo"],
    marketSize: "R$ 650K/mês",
    hotLevel: 3,
  },
  {
    id: "5",
    title: "Curso de Marketing para Psicólogos",
    category: "Marketing",
    description: "Como psicólogos podem atrair mais pacientes online",
    demandScore: 84,
    competitionLevel: "low",
    priceRange: "R$ 397 - R$ 797",
    monthlySearches: 12000,
    profitPotential: "high",
    trend: "up",
    tags: ["psicologia", "marketing", "consultório", "pacientes"],
    validationScore: 89,
    timeToMarket: "2-3 semanas",
    targetAudience: "Psicólogos autônomos",
    keyBenefits: ["Nicho específico", "Alto valor percebido", "Pouca concorrência"],
    marketSize: "R$ 480K/mês",
    hotLevel: 4,
  },
  {
    id: "6",
    title: "Planilhas de Controle Financeiro",
    category: "Finanças",
    description: "Kit completo de planilhas para organização financeira",
    demandScore: 69,
    competitionLevel: "medium",
    priceRange: "R$ 27 - R$ 97",
    monthlySearches: 22000,
    profitPotential: "medium",
    trend: "stable",
    tags: ["planilhas", "finanças", "controle", "organização"],
    validationScore: 72,
    timeToMarket: "3-5 dias",
    targetAudience: "Pessoas desorganizadas financeiramente",
    keyBenefits: ["Produção muito rápida", "Baixo investimento", "Demanda constante"],
    marketSize: "R$ 320K/mês",
    hotLevel: 3,
  },
]

const categories = ["Todos", "E-commerce", "Produtividade", "Finanças", "Saúde", "Marketing", "Educação"]

export default function ProductsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [sortBy, setSortBy] = useState("demandScore")
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filteredProducts = useMemo(() => {
    const filtered = mockProducts.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "demandScore":
          return b.demandScore - a.demandScore
        case "validationScore":
          return b.validationScore - a.validationScore
        case "monthlySearches":
          return b.monthlySearches - a.monthlySearches
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, selectedCategory, sortBy])

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]))
  }

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case "low": return "text-emerald-500"
      case "medium": return "text-amber-500"
      case "high": return "text-rose-500"
      default: return "text-muted-foreground"
    }
  }

  const getCompetitionLabel = (level: string) => {
    switch (level) {
      case "low": return "Baixa"
      case "medium": return "Média"
      case "high": return "Alta"
      default: return level
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
      case "down": return <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
      default: return <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-500"
    if (score >= 70) return "text-amber-500"
    return "text-muted-foreground"
  }

  return (
    <div className="space-y-6" data-animate>
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 via-background to-amber-500/5 border border-orange-500/20 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25">
                <Flame className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Nichos em Alta 🔥
                </h1>
                <p className="text-muted-foreground mt-1 max-w-md">
                  Oportunidades validadas para você começar seu próximo projeto digital
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur border border-border">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold">{filteredProducts.length} nichos</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600">Atualizado hoje</span>
              </div>
            </div>
          </div>

          {/* Quick Filters Bar */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar nichos, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 bg-background/80 backdrop-blur border-border/50 focus:border-orange-500/50 focus:ring-orange-500/20"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[160px] h-11 bg-background/80 backdrop-blur border-border/50">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] h-11 bg-background/80 backdrop-blur border-border/50">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demandScore">Demanda</SelectItem>
                  <SelectItem value="validationScore">Validação</SelectItem>
                  <SelectItem value="monthlySearches">Buscas</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="icon" 
                className="h-11 w-11 bg-background/80 backdrop-blur border-border/50 lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Products List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredProducts.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h3 className="font-semibold text-foreground mb-1">Nenhum nicho encontrado</h3>
                <p className="text-sm text-muted-foreground">Tente ajustar os filtros de busca</p>
              </CardContent>
            </Card>
          ) : (
            filteredProducts.map((product, index) => (
              <Card 
                key={product.id} 
                className={`group cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedProduct?.id === product.id 
                    ? 'ring-2 ring-orange-500 border-orange-500/50 shadow-md' 
                    : 'hover:border-orange-500/30'
                }`}
                onClick={() => setSelectedProduct(product)}
                data-animate
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    {/* Score Circle */}
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${
                        product.demandScore >= 90 
                          ? 'from-orange-500/20 to-amber-500/20 border-orange-500/30' 
                          : product.demandScore >= 75 
                            ? 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30' 
                            : 'from-muted to-muted border-border'
                      } border flex flex-col items-center justify-center`}>
                        <span className={`text-xl font-bold ${getScoreColor(product.demandScore)}`}>
                          {product.demandScore}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                          Score
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0.5">
                              {product.category}
                            </Badge>
                            {product.demandScore >= 90 && (
                              <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold px-2 py-0.5 border-0">
                                <Flame className="w-3 h-3 mr-1" />
                                HOT
                              </Badge>
                            )}
                            {getTrendIcon(product.trend)}
                          </div>
                          <h3 className="font-semibold text-foreground group-hover:text-orange-500 transition-colors line-clamp-1">
                            {product.title}
                          </h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 rounded-full flex-shrink-0 ${
                            favorites.includes(product.id) 
                              ? 'text-rose-500 bg-rose-500/10' 
                              : 'text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10'
                          }`}
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                        >
                          <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                        {product.description}
                      </p>

                      {/* Quick Stats */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-muted-foreground">{product.priceRange}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Target className={`w-3.5 h-3.5 ${getCompetitionColor(product.competitionLevel)}`} />
                          <span className="text-muted-foreground">
                            Concorrência {getCompetitionLabel(product.competitionLevel)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-muted-foreground">{product.timeToMarket}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-violet-500" />
                          <span className="text-muted-foreground">{(product.monthlySearches / 1000).toFixed(0)}K buscas/mês</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected Product Details */}
          {selectedProduct ? (
            <Card className="sticky top-4 border-orange-500/30 overflow-hidden" data-animate>
              <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500" />
              <CardContent className="p-5 space-y-5">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">{selectedProduct.category}</Badge>
                    {selectedProduct.trend === "up" && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Em alta
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">
                    {selectedProduct.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(selectedProduct.demandScore)}`}>
                      {selectedProduct.demandScore}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Demanda</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(selectedProduct.validationScore)}`}>
                      {selectedProduct.validationScore}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Validação</div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Faixa de Preço
                    </span>
                    <span className="font-semibold text-foreground">{selectedProduct.priceRange}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Tamanho do Mercado
                    </span>
                    <span className="font-semibold text-foreground">{selectedProduct.marketSize}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Tempo até Lançar
                    </span>
                    <span className="font-semibold text-foreground">{selectedProduct.timeToMarket}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Público-Alvo
                    </span>
                  </div>
                  <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg -mt-1">
                    {selectedProduct.targetAudience}
                  </p>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Por que esse nicho?
                  </h4>
                  <div className="space-y-2">
                    {selectedProduct.keyBenefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedProduct.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px] font-normal">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                {/* CTA */}
                <Link href="/dashboard/copy-generator" className="block">
                  <Button className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 font-semibold">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar Copy
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2" data-animate>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-muted-foreground/50" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Selecione um nicho</h3>
                <p className="text-sm text-muted-foreground max-w-[200px]">
                  Clique em um nicho para ver análise detalhada
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card data-animate>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-orange-500" />
                <h3 className="font-semibold text-sm">Resumo do Mercado</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className="text-xl font-bold text-foreground">2.8K+</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Nichos</div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
                  <div className="text-xl font-bold text-emerald-600">156</div>
                  <div className="text-[10px] text-emerald-600/80 uppercase">Em Alta</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm py-2 border-t border-border/50">
                <span className="text-muted-foreground">Seus Favoritos</span>
                <Badge variant="secondary" className="bg-rose-500/10 text-rose-600">
                  <Heart className="w-3 h-3 mr-1 fill-current" />
                  {favorites.length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Pro Features */}
          {user?.plan !== "pro" && (
            <Card className="bg-gradient-to-br from-orange-500/5 to-amber-500/5 border-orange-500/20" data-animate>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-sm">Recursos Pro</h3>
                </div>
                <div className="space-y-2.5 mb-4">
                  {[
                    "Análise de concorrentes",
                    "Alertas de oportunidades",
                    "Dados exclusivos"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="w-3.5 h-3.5 text-orange-500" />
                      {feature}
                    </div>
                  ))}
                </div>
                <Link href="/dashboard/planos">
                  <Button variant="outline" size="sm" className="w-full border-orange-500/30 hover:bg-orange-500/10">
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    Ver Planos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
