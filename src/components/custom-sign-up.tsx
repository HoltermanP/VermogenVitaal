"use client"

import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

const signUpSchema = z.object({
  firstName: z.string().min(1, "Voornaam is verplicht"),
  lastName: z.string().min(1, "Achternaam is verplicht"),
  email: z.string().email("Ongeldig e-mailadres"),
  password: z.string().min(8, "Wachtwoord moet minimaal 8 tekens lang zijn"),
})

type SignUpFormValues = z.infer<typeof signUpSchema>

interface CustomSignUpProps {
  redirectUrl?: string
  onSuccess?: () => void
}

export function CustomSignUp({ redirectUrl, onSuccess }: CustomSignUpProps) {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState("")

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: SignUpFormValues) => {
    if (!isLoaded) {
      setError("Clerk is nog niet geladen. Probeer het opnieuw.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("🔵 SignUp: Starting user creation", {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
      })

      const result = await signUp.create({
        firstName: values.firstName,
        lastName: values.lastName,
        emailAddress: values.email,
        password: values.password,
      })

      console.log("🔵 SignUp: Result received", {
        status: result.status,
        userId: result.createdUserId,
        sessionId: result.createdSessionId,
      })

      // Als e-mail verificatie vereist is
      if (result.status === "missing_requirements") {
        console.log("🔵 SignUp: Email verification required")
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
        setPendingVerification(true)
      } else if (result.status === "complete") {
        console.log("🔵 SignUp: Signup complete, setting active session")
        
        if (!result.createdSessionId) {
          console.error("❌ SignUp: No session ID in complete result")
          setError("Er is een fout opgetreden bij het aanmaken van je sessie. Probeer opnieuw in te loggen.")
          return
        }

        try {
          await setActive({ session: result.createdSessionId })
          console.log("✅ SignUp: Session activated successfully")
          
          if (onSuccess) {
            onSuccess()
          } else {
            router.push(redirectUrl || "/onboarding")
            router.refresh()
          }
        } catch (sessionError) {
          console.error("❌ SignUp: Error setting active session", sessionError)
          setError("Er is een fout opgetreden bij het activeren van je sessie. Probeer opnieuw in te loggen.")
        }
      } else {
        console.error("❌ SignUp: Unexpected status", result.status)
        setError("Er is iets misgegaan. Probeer het opnieuw.")
      }
    } catch (err: unknown) {
      console.error("❌ SignUp: Error during signup", {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      })

      const errorMessage = err instanceof Error ? err.message : "Er is een fout opgetreden"
      
      if (errorMessage.includes("form_identifier_exists")) {
        setError("Dit e-mailadres is al geregistreerd")
      } else if (errorMessage.includes("form_password_length_too_short")) {
        setError("Wachtwoord moet minimaal 8 tekens lang zijn")
      } else if (errorMessage.includes("form_password_pwned")) {
        setError("Dit wachtwoord is gecompromitteerd. Gebruik een ander wachtwoord.")
      } else if (errorMessage.includes("form_password_not_strong_enough")) {
        setError("Wachtwoord is niet sterk genoeg. Gebruik een combinatie van letters, cijfers en speciale tekens.")
      } else if (errorMessage.includes("rate_limit")) {
        setError("Te veel pogingen. Probeer het over een paar minuten opnieuw.")
      } else {
        setError(`Er is een fout opgetreden bij het aanmaken van je account: ${errorMessage}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onPressVerify = async () => {
    if (!isLoaded) {
      setError("Clerk is nog niet geladen. Probeer het opnieuw.")
      return
    }

    if (!code || code.trim().length === 0) {
      setError("Voer een verificatiecode in")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("🔵 SignUp: Attempting email verification")
      
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })

      console.log("🔵 SignUp: Verification result", {
        status: completeSignUp.status,
        sessionId: completeSignUp.createdSessionId,
      })

      if (completeSignUp.status === "complete") {
        if (!completeSignUp.createdSessionId) {
          console.error("❌ SignUp: No session ID in verification result")
          setError("Er is een fout opgetreden bij het aanmaken van je sessie. Probeer opnieuw in te loggen.")
          return
        }

        try {
          await setActive({ session: completeSignUp.createdSessionId })
          console.log("✅ SignUp: Session activated after verification")
          
          if (onSuccess) {
            onSuccess()
          } else {
            router.push(redirectUrl || "/onboarding")
            router.refresh()
          }
        } catch (sessionError) {
          console.error("❌ SignUp: Error setting active session after verification", sessionError)
          setError("Er is een fout opgetreden bij het activeren van je sessie. Probeer opnieuw in te loggen.")
        }
      } else {
        console.error("❌ SignUp: Verification incomplete", completeSignUp.status)
        setError("Verificatiecode is onjuist of verlopen")
      }
    } catch (err: unknown) {
      console.error("❌ SignUp: Error during verification", {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      })

      const errorMessage = err instanceof Error ? err.message : "Er is een fout opgetreden"
      
      if (errorMessage.includes("form_code_incorrect")) {
        setError("Verificatiecode is onjuist")
      } else if (errorMessage.includes("form_code_expired")) {
        setError("Verificatiecode is verlopen. Vraag een nieuwe code aan.")
      } else if (errorMessage.includes("rate_limit")) {
        setError("Te veel pogingen. Probeer het over een paar minuten opnieuw.")
      } else {
        setError(`Er is een fout opgetreden bij de verificatie: ${errorMessage}`)
      }
    } finally {
      setIsLoading(false)
    }
  }


  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (pendingVerification) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Verifieer je e-mailadres</h3>
          <p className="text-sm text-muted-foreground">
            We hebben een verificatiecode gestuurd naar {form.getValues("email")}
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verificatiecode</Label>
            <Input
              id="code"
              value={code}
              placeholder="Voer de code in"
              onChange={(e) => setCode(e.target.value)}
              autoComplete="one-time-code"
            />
          </div>

          <Button
            onClick={onPressVerify}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            disabled={isLoading || !code}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifiëren...
              </>
            ) : (
              "Verifiëren"
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voornaam</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Jan"
                      autoComplete="given-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Achternaam</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Jansen"
                      autoComplete="family-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mailadres</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="naam@voorbeeld.nl"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wachtwoord</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            disabled={isLoading}
          >
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
      </Form>

    </div>
  )
}

