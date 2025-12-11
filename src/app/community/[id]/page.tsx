import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageCircle, User, Clock, ThumbsUp, Reply } from "lucide-react"
import Link from "next/link"

interface CommunityPostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CommunityPostPage({ params }: CommunityPostPageProps) {
  const { id } = await params

  // Mock data voor de post
  const post = {
    id,
    title: "BV vs EMZ bij omzet van €150.000",
    author: "Jan de Vries",
    date: "2024-01-15",
    category: "BV/EMZ",
    status: "Beantwoord",
    content: `Ik heb momenteel een omzet van €150.000 per jaar en overweeg een BV op te richten. Wat zijn de belangrijkste voordelen en nadelen die ik moet overwegen?

Mijn huidige situatie:
- ZZP'er met omzet van €150.000
- Weinig kosten (thuiswerk)
- Geen personeel
- Wil graag meer fiscaal voordeel

Ik hoor verschillende verhalen over BV's en ben benieuwd naar jullie ervaringen.`,
    votes: 12,
    replies: 3
  }

  const replies = [
    {
      id: "1",
      author: "Maria Jansen",
      date: "2024-01-16",
      content: "Bij €150.000 omzet kan een BV zeker interessant zijn. Het belangrijkste voordeel is de lagere vennootschapsbelasting (19%) versus inkomstenbelasting. Wel moet je rekening houden met extra administratie en kosten.",
      votes: 8,
      isExpert: true
    },
    {
      id: "2", 
      author: "Peter van der Berg",
      date: "2024-01-16",
      content: "Ik heb zelf 2 jaar geleden de overstap gemaakt bij vergelijkbare omzet. De grootste uitdaging was de administratie, maar met een goede boekhouder valt dat mee. Het fiscale voordeel is zeker merkbaar.",
      votes: 5,
      isExpert: false
    },
    {
      id: "3",
      author: "Lisa de Wit",
      date: "2024-01-17", 
      content: "Let ook op de DGA-salaris regeling. Je moet jezelf een redelijk salaris uitkeren, wat weer inkomstenbelasting oplevert. Het netto voordeel kan daardoor kleiner zijn dan je verwacht.",
      votes: 3,
      isExpert: true
    }
  ]

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
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/community" className="text-primary hover:underline animate-fade-in">
              ← Terug naar Community
            </Link>
          </div>

          {/* Main Post */}
          <Card className="mb-6 bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2 text-foreground">{post.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {post.author}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(post.date).toLocaleDateString('nl-NL')}
                    </div>
                    <Badge variant="outline" className="text-xs border-primary/50">
                      {post.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-primary/50">
                      {post.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 ml-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gradient-financial">{post.votes}</div>
                    <div className="text-xs text-muted-foreground">stemmen</div>
                  </div>
                  <Button size="sm" variant="outline" className="border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Stem
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-line text-foreground">{post.content}</p>
              </div>
            </CardContent>
          </Card>

          {/* Replies */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              {replies.length} Antwoorden
            </h3>
            
            {replies.map((reply) => (
              <Card key={reply.id} className="ml-4 bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="gradient-financial text-white">
                          {reply.author.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{reply.author}</span>
                          {reply.isExpert && (
                            <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30">
                              Expert
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(reply.date).toLocaleDateString('nl-NL')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{reply.votes} stemmen</span>
                      <Button size="sm" variant="ghost" className="hover:bg-primary/10">
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">{reply.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reply Form */}
          <Card className="mt-8 bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <div className="w-8 h-8 gradient-financial rounded-lg flex items-center justify-center mr-3 shadow-financial">
                  <Reply className="h-4 w-4 text-white" />
                </div>
                Reageer op deze vraag
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reply" className="text-foreground">Je antwoord</Label>
                  <Textarea
                    id="reply"
                    rows={4}
                    placeholder="Deel je kennis en ervaring..."
                    className="mt-2"
                  />
                </div>
                <div className="flex justify-end">
                  <Button className="gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Plaats Antwoord
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
