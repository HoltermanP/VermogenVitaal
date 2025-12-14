"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"
import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

// Controleer of Clerk beschikbaar is
function isClerkAvailable(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  return !!publishableKey &&
         publishableKey !== 'pk_test_...' &&
         !publishableKey.includes('placeholder') &&
         !publishableKey.includes('dummy') &&
         publishableKey !== 'pk_test_dummy_key_for_development'
}

const signInSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in"),
  password: z.string().min(1, "Wachtwoord is verplicht"),
})

type SignInFormData = z.infer<typeof signInSchema>

function SignInForm() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInFormData) => {
    if (!isLoaded || !signIn) {
      setError("Authenticatie systeem is nog niet geladen")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/dashboard")
        router.refresh()
      } else {
        setError("Er is iets misgegaan bij het inloggen")
      }
    } catch (err: unknown) {
      console.error("Sign in error:", err)
      const error = err as { errors?: Array<{ message?: string }>, message?: string }
      if (error.errors && error.errors.length > 0) {
        setError(error.errors[0].message || "Inloggen mislukt")
      } else {
        setError(error.message || "Er is een fout opgetreden bij het inloggen")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="signin-email">E-mailadres</Label>
        <Input
          id="signin-email"
          type="email"
          placeholder="naam@voorbeeld.nl"
          {...register("email")}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signin-password">Wachtwoord</Label>
        <Input
          id="signin-password"
          type="password"
          placeholder="••••••••"
          {...register("password")}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading || !isLoaded}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Inloggen...
          </>
        ) : (
          "Inloggen"
        )}
      </Button>
    </form>
  )
}

export default function SignInPage() {
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/50 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Welkom terug
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold">
            Inloggen
          </CardTitle>
          <CardDescription>
            Log in om verder te gaan waar je gebleven was
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
    </div>
  )
}
