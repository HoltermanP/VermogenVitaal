// Temporarily disabled authentication for testing
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Plus, Star, Clock, User, ArrowRight, Sparkles, Zap } from "lucide-react"
import Link from "next/link"

// Mock data - in production this would come from the database
const questions = [
  {
    id: 1,
    title: "BV vs EMZ bij omzet van €150.000",
    content: "Ik heb een omzet van €150.000 en overweeg een BV op te richten. Wat zijn de voordelen?",
    author: "Jan de Vries",
    createdAt: "2024-01-15",
    category: "BV/EMZ",
    isAnswered: true,
    upvotes: 12,
    answers: 3,
    isSticky: false
  },
  {
    id: 2,
    title: "ETF allocatie voor beginnende belegger",
    content: "Ik wil beginnen met ETF beleggen. Welke allocatie raden jullie aan voor een conservatief profiel?",
    author: "Maria Jansen",
    createdAt: "2024-01-14",
    category: "Beleggen",
    isAnswered: true,
    upvotes: 8,
    answers: 2,
    isSticky: false
  },
  {
    id: 3,
    title: "Nieuwe fiscale regels 2024 - Wat verandert er?",
    content: "Er zijn weer nieuwe fiscale regels in 2024. Wat zijn de belangrijkste wijzigingen voor ondernemers?",
    author: "Tax & Wealth Hub",
    createdAt: "2024-01-01",
    category: "Fiscaal",
    isAnswered: true,
    upvotes: 25,
    answers: 1,
    isSticky: true
  },
  {
    id: 4,
    title: "Vastgoed in Duitsland - fiscale gevolgen",
    content: "Ik overweeg vastgoed te kopen in Duitsland. Wat zijn de fiscale gevolgen voor Nederlandse belastingplichtigen?",
    author: "Peter van der Berg",
    createdAt: "2024-01-13",
    category: "Vastgoed",
    isAnswered: false,
    upvotes: 5,
    answers: 0,
    isSticky: false
  },
  {
    id: 5,
    title: "Crypto belasting - hoe bereken ik mijn winst?",
    content: "Ik heb crypto gekocht en verkocht. Hoe bereken ik mijn winst voor de belastingaangifte?",
    author: "Lisa de Wit",
    createdAt: "2024-01-12",
    category: "Crypto",
    isAnswered: true,
    upvotes: 15,
    answers: 4,
    isSticky: false
  }
]

const categories = [
  { name: "Alle", count: questions.length },
  { name: "BV/EMZ", count: 1 },
  { name: "Beleggen", count: 1 },
  { name: "Fiscaal", count: 1 },
  { name: "Vastgoed", count: 1 },
  { name: "Crypto", count: 1 }
]

export default function CommunityPage() {
  // Temporarily disabled authentication for testing
  const user = { name: "Test Gebruiker", email: "test@example.com", tier: "FREE" }
  const canPost = false // FREE tier can't post

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-6">
              Community Q&A
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Stel vragen en deel kennis met andere ondernemers
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-slate-800 text-xl">Categorieën</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100/80 transition-all duration-300">
                        <span className="text-slate-700">{category.name}</span>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          {category.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {canPost && (
                <Card className="mt-6 bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-slate-800 text-xl">Nieuwe vraag</CardTitle>
                    <CardDescription className="text-slate-600">
                      Stel een vraag aan de community
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white border-0" asChild>
                      <Link href="/community/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Nieuwe vraag
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {!canPost && (
                <Card className="mt-6 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-200/50 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center mb-2">
                      <Sparkles className="h-5 w-5 text-blue-500 mr-2" />
                      <CardTitle className="text-slate-800 text-xl">Upgrade nodig</CardTitle>
                    </div>
                    <CardDescription className="text-slate-600">
                      Upgrade naar Pro om vragen te kunnen stellen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white border-0" asChild>
                      <Link href="/pricing">Upgrade naar Pro</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="recent" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border-slate-200">
                  <TabsTrigger value="recent" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800 text-slate-600">Recente vragen</TabsTrigger>
                  <TabsTrigger value="popular" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800 text-slate-600">Populair</TabsTrigger>
                  <TabsTrigger value="unanswered" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800 text-slate-600">Onbeantwoord</TabsTrigger>
                </TabsList>

                <TabsContent value="recent" className="space-y-6 mt-6">
                  {questions.map((question) => (
                    <Card key={question.id} className={`bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white/90 transition-all duration-300 hover:scale-[1.01] shadow-lg ${question.isSticky ? "border-blue-300/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/80" : ""}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              {question.isSticky && (
                                <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                                  <Star className="h-3 w-3 mr-1" />
                                  Sticky
                                </Badge>
                              )}
                              <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">
                                {question.category}
                              </Badge>
                              {question.isAnswered && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                  Beantwoord
                                </Badge>
                              )}
                            </div>
                            
                            <h3 className="font-semibold text-slate-800 text-xl mb-3">
                              <Link href={`/community/${question.id}`} className="hover:text-blue-600 transition-colors duration-300">
                                {question.title}
                              </Link>
                            </h3>
                            
                            <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                              {question.content}
                            </p>
                            
                            <div className="flex items-center gap-6 text-sm text-slate-500">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {question.author}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {question.createdAt}
                              </div>
                              <div className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" />
                                {question.answers} antwoorden
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center gap-2 ml-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-slate-800">
                                {question.upvotes}
                              </div>
                              <div className="text-xs text-slate-500">stemmen</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="popular" className="space-y-6 mt-6">
                  {questions
                    .sort((a, b) => b.upvotes - a.upvotes)
                    .map((question) => (
                      <Card key={question.id} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white/90 transition-all duration-300 hover:scale-[1.01] shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">
                                  {question.category}
                                </Badge>
                                {question.isAnswered && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                    Beantwoord
                                  </Badge>
                                )}
                              </div>
                              
                              <h3 className="font-semibold text-slate-800 text-xl mb-3">
                                <Link href={`/community/${question.id}`} className="hover:text-blue-600 transition-colors duration-300">
                                  {question.title}
                                </Link>
                              </h3>
                              
                              <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                {question.content}
                              </p>
                              
                              <div className="flex items-center gap-6 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  {question.author}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  {question.createdAt}
                                </div>
                                <div className="flex items-center gap-2">
                                  <MessageCircle className="h-4 w-4" />
                                  {question.answers} antwoorden
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-center gap-2 ml-6">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-slate-800">
                                  {question.upvotes}
                                </div>
                                <div className="text-xs text-slate-500">stemmen</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </TabsContent>

                <TabsContent value="unanswered" className="space-y-6 mt-6">
                  {questions
                    .filter(q => !q.isAnswered)
                    .map((question) => (
                      <Card key={question.id} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white/90 transition-all duration-300 hover:scale-[1.01] shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">
                                  {question.category}
                                </Badge>
                                <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                                  Onbeantwoord
                                </Badge>
                              </div>
                              
                              <h3 className="font-semibold text-slate-800 text-xl mb-3">
                                <Link href={`/community/${question.id}`} className="hover:text-blue-600 transition-colors duration-300">
                                  {question.title}
                                </Link>
                              </h3>
                              
                              <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                {question.content}
                              </p>
                              
                              <div className="flex items-center gap-6 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  {question.author}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  {question.createdAt}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-center gap-2 ml-6">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-slate-800">
                                  {question.upvotes}
                                </div>
                                <div className="text-xs text-slate-500">stemmen</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}