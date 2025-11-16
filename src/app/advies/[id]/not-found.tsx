import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden py-12 flex items-center justify-center">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-16 w-16 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl mb-2">Onderwerp niet gevonden</CardTitle>
              <CardDescription className="text-lg">
                Het gevraagde belastingonderwerp bestaat niet of is niet beschikbaar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="mt-4">
                <Link href="/advies">
                  Terug naar overzicht
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

