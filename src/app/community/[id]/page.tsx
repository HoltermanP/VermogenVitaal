import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle, User, Clock, ThumbsUp, Reply } from "lucide-react"
import Link from "next/link"

interface CommunityPostPageProps {
  params: {
    id: string
  }
}

export default function CommunityPostPage({ params }: CommunityPostPageProps) {
  // Mock data voor de post
  const post = {
    id: params.id,
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/community" className="text-blue-600 hover:underline">
              ← Terug naar Community
            </Link>
          </div>

          {/* Main Post */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {post.author}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(post.date).toLocaleDateString('nl-NL')}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                      {post.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 ml-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{post.votes}</div>
                    <div className="text-xs text-gray-500">stemmen</div>
                  </div>
                  <Button size="sm" variant="outline">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Stem
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
              </div>
            </CardContent>
          </Card>

          {/* Replies */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {replies.length} Antwoorden
            </h3>
            
            {replies.map((reply) => (
              <Card key={reply.id} className="ml-4">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {reply.author.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{reply.author}</span>
                          {reply.isExpert && (
                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                              Expert
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(reply.date).toLocaleDateString('nl-NL')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{reply.votes} stemmen</span>
                      <Button size="sm" variant="ghost">
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{reply.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reply Form */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Reply className="h-5 w-5 mr-2" />
                Reageer op deze vraag
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Je antwoord
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder="Deel je kennis en ervaring..."
                  />
                </div>
                <div className="flex justify-end">
                  <Button>
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
