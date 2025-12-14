"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Zap, CheckCircle } from "lucide-react"
import { useSignUp } from "@clerk/nextjs"
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

const signUpSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in"),
  password: z.string().min(8, "Wachtwoord moet minimaal 8 tekens lang zijn"),
  firstName: z.string().min(1, "Voornaam is verplicht"),
  lastName: z.string().min(1, "Achternaam is verplicht"),
})

type SignUpFormData = z.infer<typeof signUpSchema>

function SignUpForm() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const router = useRouter()
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpFormData) => {
    if (!isLoaded || !signUp) {
      setError("Authenticatie systeem is nog niet geladen")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      })

      // Verstuur verificatie email
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setPendingVerification(true)
    } catch (err: unknown) {
      console.error("Sign up error:", err)
      const error = err as { errors?: Array<{ message?: string }>, message?: string }
      if (error.errors && error.errors.length > 0) {
        setError(error.errors[0].message || "Aanmelden mislukt")
      } else {
        setError(error.message || "Er is een fout opgetreden bij het aanmelden")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signUp) return

    setIsLoading(true)
    setError("")

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/onboarding")
        router.refresh()
      } else {
        setError("Verificatie mislukt")
      }
    } catch (err: unknown) {
      console.error("Verification error:", err)
      const error = err as { errors?: Array<{ message?: string }>, message?: string }
      if (error.errors && error.errors.length > 0) {
        setError(error.errors[0].message || "Verificatie mislukt")
      } else {
        setError(error.message || "Er is een fout opgetreden bij de verificatie")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (pendingVerification) {
    return (
      <form onSubmit={onVerifyCode} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="verification-code">Verificatiecode</Label>
          <Input
            id="verification-code"
            type="text"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground">
            We hebben een verificatiecode gestuurd naar {getValues("email")}
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || !isLoaded}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifiëren...
            </>
          ) : (
            "Verifiëren"
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => {
            setPendingVerification(false)
            setCode("")
            setError("")
          }}
        >
          Terug
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="signup-firstname">Voornaam</Label>
          <Input
            id="signup-firstname"
            type="text"
            placeholder="Jan"
            {...register("firstName")}
            disabled={isLoading}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-lastname">Achternaam</Label>
          <Input
            id="signup-lastname"
            type="text"
            placeholder="Jansen"
            {...register("lastName")}
            disabled={isLoading}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">E-mailadres</Label>
        <Input
          id="signup-email"
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
        <Label htmlFor="signup-password">Wachtwoord</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="••••••••"
          {...register("password")}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Minimaal 8 tekens
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading || !isLoaded}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Account aanmaken...
          </>
        ) : (
          "Account aanmaken"
        )}
      </Button>
    </form>
  )
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/50 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Veilig & Vertrouwd
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            Welkom bij aivermogen.nl
            <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white text-xs">
              <Zap className="h-3 w-3 mr-1" />
              30 dagen
            </Badge>
          </CardTitle>
          <CardDescription>
            Start gratis en ontdek hoe je belasting kunt optimaliseren
          </CardDescription>

          {/* Features list */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>QuickScan Belasting (5 min)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>AI Document Analyse</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Uitgebreide calculators</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  )
}
