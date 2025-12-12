import { SignUp } from "@clerk/nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Controleer of Clerk beschikbaar is
function isClerkAvailable(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  return !!publishableKey &&
         publishableKey !== 'pk_test_...' &&
         !publishableKey.includes('placeholder') &&
         !publishableKey.includes('dummy')
}

export default function SignUpPage() {
  if (!isClerkAvailable()) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Authenticatie niet geconfigureerd</h1>
          <p className="text-muted-foreground">
            Clerk authenticatie is nog niet ingesteld. Configureer eerst de environment variabelen.
          </p>
          <Link href="/">
            <Button>Terug naar homepage</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  )
}
