"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Linkedin, 
  Plus, 
  Eye, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

interface LinkedInPost {
  id: string
  title: string
  content: string
  topic: string
  status: string
  scheduledFor: string | null
  postedAt: string | null
  createdAt: string
}

export default function LinkedInAdminPage() {
  const [posts, setPosts] = useState<LinkedInPost[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [selectedPost, setSelectedPost] = useState<LinkedInPost | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/linkedin/posts")
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast.error("Fout bij ophalen van posts")
    } finally {
      setLoading(false)
    }
  }

  const generatePosts = async (count: number = 5) => {
    setGenerating(true)
    try {
      const response = await fetch("/api/linkedin/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ count }),
      })

      if (!response.ok) {
        throw new Error("Fout bij genereren van posts")
      }

      const data = await response.json()
      toast.success(data.message)
      await fetchPosts()
    } catch (error) {
      console.error("Error generating posts:", error)
      toast.error("Fout bij genereren van posts")
    } finally {
      setGenerating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Concept</Badge>
      case "SCHEDULED":
        return <Badge variant="outline"><Calendar className="w-3 h-3 mr-1" />Gepland</Badge>
      case "POSTED":
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Gepubliceerd</Badge>
      case "FAILED":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Mislukt</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const draftPosts = posts.filter(p => p.status === "DRAFT")
  const scheduledPosts = posts.filter(p => p.status === "SCHEDULED")
  const postedPosts = posts.filter(p => p.status === "POSTED")

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Linkedin className="w-8 h-8 text-blue-600" />
            LinkedIn Posts Beheer
          </h1>
          <p className="text-muted-foreground mt-2">
            Genereer en beheer LinkedIn posts voor aivermogen.nl
          </p>
        </div>
        <Button
          onClick={() => generatePosts(5)}
          disabled={generating}
          size="lg"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Genereren...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Genereer 5 Posts
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="draft" className="space-y-4">
        <TabsList>
          <TabsTrigger value="draft">
            Concepten ({draftPosts.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Gepland ({scheduledPosts.length})
          </TabsTrigger>
          <TabsTrigger value="posted">
            Gepubliceerd ({postedPosts.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Alles ({posts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draft" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : draftPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Geen concepten gevonden</p>
                <Button
                  onClick={() => generatePosts(5)}
                  disabled={generating}
                  className="mt-4"
                >
                  Genereer Posts
                </Button>
              </CardContent>
            </Card>
          ) : (
            draftPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                        {getStatusBadge(post.status)}
                        <Badge variant="outline">{post.topic}</Badge>
                      </div>
                      <CardDescription>
                        Gemaakt op {new Date(post.createdAt).toLocaleDateString("nl-NL")}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPost(post)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Bekijk
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.content}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          {scheduledPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Geen geplande posts</p>
              </CardContent>
            </Card>
          ) : (
            scheduledPosts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                        {getStatusBadge(post.status)}
                      </div>
                      <CardDescription>
                        Gepland voor {post.scheduledFor ? new Date(post.scheduledFor).toLocaleString("nl-NL") : "Niet gepland"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="posted" className="space-y-4">
          {postedPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Geen gepubliceerde posts</p>
              </CardContent>
            </Card>
          ) : (
            postedPosts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                        {getStatusBadge(post.status)}
                      </div>
                      <CardDescription>
                        Gepubliceerd op {post.postedAt ? new Date(post.postedAt).toLocaleString("nl-NL") : "Onbekend"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      {getStatusBadge(post.status)}
                      <Badge variant="outline">{post.topic}</Badge>
                    </div>
                    <CardDescription>
                      {new Date(post.createdAt).toLocaleString("nl-NL")}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPost(post)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Bekijk
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle>{selectedPost.title}</CardTitle>
                    {getStatusBadge(selectedPost.status)}
                    <Badge variant="outline">{selectedPost.topic}</Badge>
                  </div>
                  <CardDescription>
                    {new Date(selectedPost.createdAt).toLocaleString("nl-NL")}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPost(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Separator className="my-4" />
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {selectedPost.content}
                </pre>
              </div>
              <Separator className="my-4" />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedPost.content)
                    toast.success("Content gekopieerd naar clipboard")
                  }}
                >
                  Kopieer Content
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedPost(null)}
                >
                  Sluiten
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

