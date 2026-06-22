"use client"

import { useSignIn } from "@clerk/nextjs"
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
import { Loader2 } from "lucide-react"

const signInSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres"),
  password: z.string().min(1, "Wachtwoord is verplicht"),
})

type SignInFormValues = z.infer<typeof signInSchema>

interface CustomSignInProps {
  redirectUrl?: string
  onSuccess?: () => void
}

export function CustomSignIn({ redirectUrl, onSuccess }: CustomSignInProps) {
  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: SignInFormValues) => {
    if (!isLoaded) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn.create({
        identifier: values.email,
        password: values.password,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        
        if (onSuccess) {
          onSuccess()
        } else {
          // Gebruik alleen router.push, refresh gebeurt automatisch
          router.push(redirectUrl || "/dashboard")
        }
      } else {
        setError("Er is iets misgegaan. Probeer het opnieuw.")
      }
    } catch (err: unknown) {
      // Clerk API-fouten bevatten een gestructureerde errors-array met de echte oorzaak.
      // De oude code keek alleen naar err.message (vaak leeg) waardoor altijd de
      // generieke melding verscheen en de werkelijke oorzaak verborgen bleef.
      const clerkErr = err as {
        errors?: Array<{ code?: string; message?: string; longMessage?: string }>
      }
      const clerkError = clerkErr?.errors?.[0]
      const code = clerkError?.code || ""
      const detail =
        clerkError?.longMessage ||
        clerkError?.message ||
        (err instanceof Error ? err.message : "")

      console.error("[SignIn] Clerk error:", { code, detail, raw: err })

      if (code === "form_identifier_not_found") {
        setError("E-mailadres niet gevonden")
      } else if (code === "form_password_incorrect") {
        setError("Onjuist wachtwoord")
      } else if (code === "session_exists") {
        setError("Je bent al ingelogd. Vernieuw de pagina (F5).")
      } else if (code === "form_param_format_invalid") {
        setError("Ongeldig e-mailadres of wachtwoord.")
      } else {
        // Toon de echte Clerk-melding (incl. code) zodat de oorzaak zichtbaar is.
        setError(detail ? `${detail}${code ? ` (${code})` : ""}` : "Er is een fout opgetreden bij het inloggen")
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

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
                    autoComplete="current-password"
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
                Inloggen...
              </>
            ) : (
              "Inloggen"
            )}
          </Button>
        </form>
      </Form>

    </div>
  )
}











