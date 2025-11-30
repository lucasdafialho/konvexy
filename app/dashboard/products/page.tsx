"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Flame,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Heart,
  Eye,
  Star,
  Zap,
  Target,
  Clock,
  Users,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
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
  isFavorite?: boolean
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
const competitionLevels = ["Todos", "low", "medium", "high"]
const profitPotentials = ["Todos", "low", "medium", "high", "very-high"]

export default function ProductsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [selectedCompetition, setSelectedCompetition] = useState("Todos")
  const [selectedProfit, setSelectedProfit] = useState("Todos")
  const [sortBy, setSortBy] = useState("demandScore")
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const filteredProducts = useMemo(() => {
    const filtered = mockProducts.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory
      const matchesCompetition = selectedCompetition === "Todos" || product.competitionLevel === selectedCompetition
      const matchesProfit = selectedProfit === "Todos" || product.profitPotential === selectedProfit

      return matchesSearch && matchesCategory && matchesCompetition && matchesProfit
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
  }, [searchTerm, selectedCategory, selectedCompetition, selectedProfit, sortBy])

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]))
  }

  const getCompetitionStyles = (level: string) => {
    switch (level) {
      case "low":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "high":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getProfitStyles = (level: string) => {
    switch (level) {
      case "low":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
      case "medium":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "high":
        return "bg-violet-500/10 text-violet-400 border-violet-500/20"
      case "very-high":
        return "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-emerald-400" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-rose-400" />
      default:
        return <BarChart3 className="w-4 h-4 text-muted-foreground" />
    }
  }

  const renderHotLevel = (level: number = 3) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Flame 
            key={i} 
            className={`w-3.5 h-3.5 ${i < level ? 'text-orange-500 fill-orange-500' : 'text-muted-foreground/30'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen" data-animate>
      {/* Header Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-violet-500/5 to-background border border-primary/10 mb-8 p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMDksMzQsMjE3LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-lg shadow-primary/25">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Produtos em Alta</h1>
              <p className="text-muted-foreground">Descubra as melhores oportunidades do momento</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{filteredProducts.length} produtos encontrados</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium">Atualizado hoje</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="mb-8 border-border/50 bg-card/50 backdrop-blur-sm" data-animate>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Filtros</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Concorrência</Label>
              <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {competitionLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level === "Todos" ? "Todos" : level === "low" ? "🟢 Baixa" : level === "medium" ? "🟡 Média" : "🔴 Alta"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Potencial</Label>
              <Select value={selectedProfit} onValueChange={setSelectedProfit}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {profitPotentials.map((profit) => (
                    <SelectItem key={profit} value={profit}>
                      {profit === "Todos"
                        ? "Todos"
                        : profit === "low"
                          ? "Baixo"
                          : profit === "medium"
                            ? "Médio"
                            : profit === "high"
                              ? "Alto"
                              : "🔥 Muito Alto"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Ordenar por</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demandScore">📊 Demanda</SelectItem>
                  <SelectItem value="validationScore">✅ Validação</SelectItem>
                  <SelectItem value="monthlySearches">🔍 Buscas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Products List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredProducts.map((product, index) => (
            <Card 
              key={product.id} 
              className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 ${selectedProduct?.id === product.id ? 'ring-2 ring-primary/50 border-primary/50' : ''}`}
              data-animate
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Hot badge for top products */}
              {product.demandScore >= 90 && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    HOT
                  </div>
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                        {product.category}
                      </Badge>
                      <Badge className={`border ${getCompetitionStyles(product.competitionLevel)}`}>
                        {product.competitionLevel === "low"
                          ? "Baixa Concorrência"
                          : product.competitionLevel === "medium"
                            ? "Média Concorrência"
                            : "Alta Concorrência"}
                      </Badge>
                      <Badge className={`border ${getProfitStyles(product.profitPotential)}`}>
                        {product.profitPotential === "very-high" && <Zap className="w-3 h-3 mr-1" />}
                        {product.profitPotential === "low"
                          ? "Baixo Lucro"
                          : product.profitPotential === "medium"
                            ? "Médio Lucro"
                            : product.profitPotential === "high"
                              ? "Alto Lucro"
                              : "Lucro Explosivo"}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {product.title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-muted-foreground line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                      className={`rounded-full ${favorites.includes(product.id) ? "text-rose-500 bg-rose-500/10" : "text-muted-foreground hover:text-rose-500"}`}
                    >
                      <Heart className={`w-5 h-5 ${favorites.includes(product.id) ? "fill-current" : ""}`} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setSelectedProduct(product)}
                      className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
                    >
                      <Eye className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-3 p-4 rounded-xl bg-muted/30 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                      {product.demandScore}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Demanda</div>
                  </div>
                  <div className="text-center border-l border-border/50">
                    <div className="text-2xl font-bold text-foreground">{product.validationScore}</div>
                    <div className="text-xs text-muted-foreground mt-1">Validação</div>
                  </div>
                  <div className="text-center border-l border-border/50">
                    <div className="text-2xl font-bold text-foreground">{(product.monthlySearches / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-muted-foreground mt-1">Buscas/mês</div>
                  </div>
                  <div className="text-center border-l border-border/50 flex flex-col items-center justify-center">
                    {getTrendIcon(product.trend)}
                    <div className="text-xs text-muted-foreground mt-1">Tendência</div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      <span>{product.priceRange}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>{product.timeToMarket}</span>
                    </div>
                  </div>
                  {renderHotLevel(product.hotLevel)}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {product.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs bg-muted/50 hover:bg-muted transition-colors">
                      #{tag}
                    </Badge>
                  ))}
                  {product.tags.length > 4 && (
                    <Badge variant="secondary" className="text-xs bg-muted/50">
                      +{product.tags.length - 4}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Details */}
          {selectedProduct ? (
            <Card className="sticky top-6 border-primary/20 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm overflow-hidden" data-animate>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <CardHeader className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Análise Detalhada</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-5">
                <div>
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{selectedProduct.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">{selectedProduct.description}</p>
                </div>

                <Separator className="bg-border/50" />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Tamanho do Mercado
                    </span>
                    <span className="text-sm font-bold text-emerald-500">{selectedProduct.marketSize}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Público-Alvo
                    </span>
                    <span className="text-sm font-medium text-foreground">{selectedProduct.targetAudience}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Faixa de Preço
                    </span>
                    <span className="text-sm font-medium text-foreground">{selectedProduct.priceRange}</span>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Principais Benefícios
                  </h4>
                  <ul className="space-y-2">
                    {selectedProduct.keyBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                        </div>
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator className="bg-border/50" />

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Score de Oportunidade</span>
                    <span className="text-sm font-bold text-primary">{selectedProduct.validationScore}/100</span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-500"
                      style={{ width: `${selectedProduct.validationScore}%` }}
                    />
                  </div>
                </div>

                <Link href="/dashboard/copy-generator" className="block">
                  <Button className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white shadow-lg shadow-primary/25 group">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar Copy para Este Produto
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2 border-border/50 bg-muted/20" data-animate>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Eye className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground max-w-[200px]">
                  Clique no ícone de visualização de um produto para ver a análise detalhada
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm" data-animate>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-muted/30 text-center">
                  <div className="text-2xl font-bold text-foreground">2,847</div>
                  <div className="text-xs text-muted-foreground mt-1">Produtos Analisados</div>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 text-center">
                  <div className="text-2xl font-bold text-emerald-500">156</div>
                  <div className="text-xs text-muted-foreground mt-1">Oportunidades</div>
                </div>
              </div>
              <Separator className="bg-border/50" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Mercado Total</span>
                <span className="text-sm font-bold text-foreground">R$ 12.4M/mês</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Seus Favoritos</span>
                <Badge variant="secondary" className="bg-rose-500/10 text-rose-500 border-rose-500/20">
                  <Heart className="w-3 h-3 mr-1 fill-current" />
                  {favorites.length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Pro Features */}
          {user?.plan !== "pro" && (
            <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 to-violet-500/5" data-animate>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <CardHeader className="relative pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary fill-primary" />
                  Recursos Pro
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-3">
                {[
                  "Análise de concorrentes em tempo real",
                  "Histórico completo de tendências",
                  "Alertas de novas oportunidades",
                  "Dados exclusivos de mercado"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
                <Link href="/dashboard/planos" className="block pt-2">
                  <Button size="sm" className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90">
                    <Crown className="w-4 h-4 mr-2" />
                    Fazer Upgrade
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

function Crown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  )
}
