"use client"

import { SignIn, SignUp } from "@clerk/nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function SignInDialog() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="border-primary/50 hover:bg-primary/10 hover:border-primary"
      >
        Inloggen
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inloggen</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <SignIn
              routing="path"
              path="/auth/signin"
              redirectUrl={typeof window !== 'undefined' ? window.location.pathname : '/dashboard'}
              appearance={{
                baseTheme: undefined,
                variables: {
                  colorPrimary: "hsl(var(--primary))",
                  colorBackground: "hsl(var(--background))",
                  colorInputBackground: "hsl(var(--background))",
                  colorInputText: "hsl(var(--foreground))",
                  colorText: "hsl(var(--foreground))",
                  borderRadius: "0.5rem"
                },
                elements: {
                  formButtonPrimary: "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium",
                  card: "shadow-none border-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "border border-border hover:bg-accent transition-colors",
                  socialButtonsBlockButtonText: "text-foreground",
                  dividerLine: "bg-border",
                  dividerText: "text-muted-foreground",
                  formFieldLabel: "text-foreground font-medium",
                  formFieldInput: "border-border focus:border-primary focus:ring-1 focus:ring-primary/20",
                  footerActionLink: "text-primary hover:text-primary/80 font-medium",
                  identityPreviewEditButton: "text-primary",
                  formFieldErrorText: "text-red-600 text-sm",
                  alert: "border-red-200 bg-red-50 text-red-800",
                  alertText: "text-red-800"
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function AuthDialog() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"signin" | "signup">("signin")

  return (
    <>
      <Button
        className="gradient-financial text-white shadow-financial hover:shadow-financial-lg"
        onClick={() => setOpen(true)}
      >
        Aanmelden
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{mode === "signin" ? "Inloggen" : "Account aanmaken"}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {mode === "signin" ? (
              <SignIn
                routing="path"
                path="/auth/signin"
                redirectUrl={typeof window !== 'undefined' ? window.location.pathname : '/dashboard'}
                appearance={{
                  baseTheme: undefined,
                  variables: {
                    colorPrimary: "hsl(var(--primary))",
                    colorBackground: "hsl(var(--background))",
                    colorInputBackground: "hsl(var(--background))",
                    colorInputText: "hsl(var(--foreground))",
                    colorText: "hsl(var(--foreground))",
                    borderRadius: "0.5rem"
                  },
                  elements: {
                    formButtonPrimary: "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium",
                    card: "shadow-none border-0",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "border border-border hover:bg-accent transition-colors",
                    socialButtonsBlockButtonText: "text-foreground",
                    dividerLine: "bg-border",
                    dividerText: "text-muted-foreground",
                    formFieldLabel: "text-foreground font-medium",
                    formFieldInput: "border-border focus:border-primary focus:ring-1 focus:ring-primary/20",
                    footerActionLink: "text-primary hover:text-primary/80 font-medium",
                    identityPreviewEditButton: "text-primary",
                    formFieldErrorText: "text-red-600 text-sm",
                    alert: "border-red-200 bg-red-50 text-red-800",
                    alertText: "text-red-800"
                  }
                }}
              />
            ) : (
              <SignUp
                routing="path"
                path="/auth/signup"
                redirectUrl={typeof window !== 'undefined' ? window.location.pathname : '/dashboard'}
                appearance={{
                  baseTheme: undefined,
                  variables: {
                    colorPrimary: "hsl(var(--primary))",
                    colorBackground: "hsl(var(--background))",
                    colorInputBackground: "hsl(var(--background))",
                    colorInputText: "hsl(var(--foreground))",
                    colorText: "hsl(var(--foreground))",
                    borderRadius: "0.5rem"
                  },
                  elements: {
                    formButtonPrimary: "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium",
                    card: "shadow-none border-0",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "border border-border hover:bg-accent transition-colors",
                    socialButtonsBlockButtonText: "text-foreground",
                    dividerLine: "bg-border",
                    dividerText: "text-muted-foreground",
                    formFieldLabel: "text-foreground font-medium",
                    formFieldInput: "border-border focus:border-primary focus:ring-1 focus:ring-primary/20",
                    footerActionLink: "text-primary hover:text-primary/80 font-medium",
                    identityPreviewEditButton: "text-primary",
                    formFieldErrorText: "text-red-600 text-sm",
                    alert: "border-red-200 bg-red-50 text-red-800",
                    alertText: "text-red-800"
                  }
                }}
              />
            )}
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {mode === "signin" ? (
                <button
                  onClick={() => setMode("signup")}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Nog geen account? Maak er een aan
                </button>
              ) : (
                <button
                  onClick={() => setMode("signin")}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Al een account? Log in
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
