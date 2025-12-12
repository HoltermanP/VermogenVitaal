// Temporarily disabled authentication for testing
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Plus, Star, Clock, User, Sparkles } from "lucide-react"
import Link from "next/link"
import { NewsTicker } from "@/components/news-ticker"

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
      upvotes: 18,
      answers: 2,
      isSticky: false
    },
    {
      id: 3,
      title: "Nieuwe fiscale regels 2024 - Wat verandert er?",
      content: "Er zijn weer nieuwe fiscale regels in 2024. Wat zijn de belangrijkste wijzigingen voor ondernemers?",
      author: "aivermogen.nl",
      createdAt: "2024-01-01",
      category: "Fiscaal",
      isAnswered: true,
      upvotes: 43,
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
      upvotes: 46,
      answers: 4,
      isSticky: false
    }
]

const categories = [
  { name: "Alle", count: questions.length },
  { name: "BV/EMZ", count: questions.filter(q => q.category === "BV/EMZ").length },
  { name: "Beleggen", count: questions.filter(q => q.category === "Beleggen").length },
  { name: "Fiscaal", count: questions.filter(q => q.category === "Fiscaal").length },
  { name: "Vastgoed", count: questions.filter(q => q.category === "Vastgoed").length },
  { name: "Crypto", count: questions.filter(q => q.category === "Crypto").length }
]

export default function CommunityPage() {
  // Temporarily disabled authentication for testing
  const canPost = false // FREE tier can't post

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden py-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        {/* Financial grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
              <span className="text-gradient-financial">Community Q&A</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in delay-200">
              Stel vragen en deel kennis met andere ondernemers en investeerders
            </p>
          </div>

          {/* News Ticker - Compact */}
          <div className="mb-6">
            <NewsTicker pagePath="/community" />
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-300">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">Categorieën</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/10 hover:border-primary/20 border border-transparent transition-all duration-300">
                        <span className="text-foreground">{category.name}</span>
                        <Badge variant="secondary" className="bg-accent/20 text-foreground">
                          {category.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {canPost && (
                <Card className="mt-6 bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-400">
                  <CardHeader>
                    <CardTitle className="text-xl text-foreground">Nieuwe vraag</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Stel een vraag aan de community
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300" asChild>
                      <Link href="/community/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Nieuwe vraag
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {!canPost && (
                <Card className="mt-6 bg-accent/10 border border-primary/20 shadow-xl hover:shadow-financial-lg hover:border-primary/40 transition-all duration-500 animate-fade-in delay-400">
                  <CardHeader>
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 gradient-financial rounded-lg flex items-center justify-center mr-3 shadow-financial">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-xl text-foreground">Upgrade nodig</CardTitle>
                    </div>
                    <CardDescription className="text-muted-foreground">
                      Upgrade naar Pro om vragen te kunnen stellen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300" asChild>
                      <Link href="/pricing">Upgrade naar Pro</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="recent" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-card/80 border-border">
                  <TabsTrigger value="recent" className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Recente vragen</TabsTrigger>
                  <TabsTrigger value="popular" className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Populair</TabsTrigger>
                  <TabsTrigger value="unanswered" className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Onbeantwoord</TabsTrigger>
                </TabsList>

                <TabsContent value="recent" className="space-y-6 mt-6">
                  {questions.map((question) => (
                    <Card key={question.id} className={`bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 hover:scale-[1.01] ${question.isSticky ? "border-primary/50 bg-accent/10" : ""}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              {question.isSticky && (
                                <Badge variant="default" className="gradient-financial text-white shadow-financial">
                                  <Star className="h-3 w-3 mr-1" />
                                  Sticky
                                </Badge>
                              )}
                              <Badge variant="outline" className="border-primary/50 text-foreground">
                                {question.category}
                              </Badge>
                              {question.isAnswered && (
                                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                                  Beantwoord
                                </Badge>
                              )}
                            </div>
                            
                            <h3 className="font-semibold text-xl mb-3 text-foreground">
                              <Link href={`/community/${question.id}`} className="hover:text-primary transition-colors duration-300">
                                {question.title}
                              </Link>
                            </h3>
                            
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                              {question.content}
                            </p>
                            
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
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
                              <div className="text-2xl font-bold text-gradient-financial">
                                {question.upvotes}
                              </div>
                              <div className="text-xs text-muted-foreground">stemmen</div>
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
                      <Card key={question.id} className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 hover:scale-[1.01]">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="border-primary/50 text-foreground">
                                  {question.category}
                                </Badge>
                                {question.isAnswered && (
                                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                                    Beantwoord
                                  </Badge>
                                )}
                              </div>
                              
                              <h3 className="font-semibold text-xl mb-3 text-foreground">
                                <Link href={`/community/${question.id}`} className="hover:text-primary transition-colors duration-300">
                                  {question.title}
                                </Link>
                              </h3>
                              
                              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                {question.content}
                              </p>
                              
                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
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
                                <div className="text-2xl font-bold text-gradient-financial">
                                  {question.upvotes}
                                </div>
                                <div className="text-xs text-muted-foreground">stemmen</div>
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
                      <Card key={question.id} className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 hover:scale-[1.01]">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="border-primary/50 text-foreground">
                                  {question.category}
                                </Badge>
                                <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/30">
                                  Onbeantwoord
                                </Badge>
                              </div>
                              
                              <h3 className="font-semibold text-xl mb-3 text-foreground">
                                <Link href={`/community/${question.id}`} className="hover:text-primary transition-colors duration-300">
                                  {question.title}
                                </Link>
                              </h3>
                              
                              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                {question.content}
                              </p>
                              
                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
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
                                <div className="text-2xl font-bold text-gradient-financial">
                                  {question.upvotes}
                                </div>
                                <div className="text-xs text-muted-foreground">stemmen</div>
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