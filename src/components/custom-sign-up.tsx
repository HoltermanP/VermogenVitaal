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
    if (!isLoaded) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await signUp.create({
        firstName: values.firstName,
        lastName: values.lastName,
        emailAddress: values.email,
        password: values.password,
      })

      // Als e-mail verificatie vereist is
      if (result.status === "missing_requirements") {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
        setPendingVerification(true)
      } else if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        
        if (onSuccess) {
          onSuccess()
        } else {
          router.push(redirectUrl || "/onboarding")
          router.refresh()
        }
      } else {
        setError("Er is iets misgegaan. Probeer het opnieuw.")
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Er is een fout opgetreden"
      setError(
        errorMessage.includes("form_identifier_exists")
          ? "Dit e-mailadres is al geregistreerd"
          : errorMessage.includes("form_password_length_too_short")
          ? "Wachtwoord moet minimaal 8 tekens lang zijn"
          : "Er is een fout opgetreden bij het aanmaken van je account"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const onPressVerify = async () => {
    if (!isLoaded) return

    setIsLoading(true)
    setError(null)

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId })
        
        if (onSuccess) {
          onSuccess()
        } else {
          router.push(redirectUrl || "/onboarding")
          router.refresh()
        }
      } else {
        setError("Verificatiecode is onjuist")
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Er is een fout opgetreden"
      setError(errorMessage.includes("form_code_incorrect") 
        ? "Verificatiecode is onjuist" 
        : "Er is een fout opgetreden bij de verificatie")
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

