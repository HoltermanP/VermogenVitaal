"use client"

import { useState } from "react"
import { useSignIn, useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Shield, Zap, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

// Controleer of Clerk beschikbaar is
function isClerkAvailable(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  return !!publishableKey &&
         publishableKey !== 'pk_test_...' &&
         !publishableKey.includes('placeholder') &&
         !publishableKey.includes('dummy') &&
         publishableKey !== 'pk_test_dummy_key_for_development'
}

// Validatie schema's
const signInSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in"),
  password: z.string().min(1, "Wachtwoord is verplicht"),
})

const signUpSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in"),
  password: z.string().min(8, "Wachtwoord moet minimaal 8 tekens lang zijn"),
  firstName: z.string().min(1, "Voornaam is verplicht"),
  lastName: z.string().min(1, "Achternaam is verplicht"),
})

type SignInFormData = z.infer<typeof signInSchema>
type SignUpFormData = z.infer<typeof signUpSchema>

// Sign In Form Component
function SignInForm({ onSuccess }: { onSuccess?: () => void }) {
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
        onSuccess?.()
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

// Sign Up Form Component
function SignUpForm({ onSuccess }: { onSuccess?: () => void }) {
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
        onSuccess?.()
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

export function SignInDialog({ 
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange,
  showTrigger = true 
}: { 
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showTrigger?: boolean
} = {}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  // Als Clerk niet beschikbaar is, toon direct link naar signin pagina
  if (!isClerkAvailable()) {
    return (
      <Button variant="ghost" size="sm" asChild>
        <Link href="/auth/signin">Inloggen</Link>
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            Inloggen
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/50 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Welkom terug
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-bold">
            Inloggen
          </DialogTitle>
          <DialogDescription>
            Log in om verder te gaan waar je gebleven was
          </DialogDescription>
        </DialogHeader>

        <Card className="border-0 shadow-none mt-6">
          <CardContent className="pt-6">
            <SignInForm onSuccess={() => setOpen(false)} />
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}

export function AuthDialog() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("signin")

  // Als Clerk niet beschikbaar is, toon direct link naar signup pagina
  if (!isClerkAvailable()) {
    return (
      <Button size="sm" className="gap-2" asChild>
        <Link href="/auth/signup">
          <Sparkles className="h-4 w-4" />
          Start gratis
        </Link>
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Start gratis
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/50 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Veilig & Vertrouwd
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-bold">
            Welkom bij aivermogen.nl
          </DialogTitle>
          <DialogDescription>
            Start gratis en ontdek hoe je belasting kunt optimaliseren
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Inloggen</TabsTrigger>
            <TabsTrigger value="signup">Account aanmaken</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-6">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Welkom terug!</CardTitle>
                <CardDescription>
                  Log in om verder te gaan waar je gebleven was
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignInForm onSuccess={() => setOpen(false)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup" className="mt-6">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  Start gratis proefperiode
                  <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    30 dagen
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Geen creditcard nodig • Annuleer op elk moment
                </CardDescription>

                {/* Features list */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>QuickScan Belasting (5 min)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>AI Document Analyse</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Uitgebreide calculators</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <SignUpForm onSuccess={() => setOpen(false)} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
