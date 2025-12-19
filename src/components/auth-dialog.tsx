"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CustomSignIn } from "@/components/custom-sign-in"
import { CustomSignUp } from "@/components/custom-sign-up"

export function SignInDialog() {
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

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
            <CustomSignIn
              redirectUrl={typeof window !== 'undefined' ? window.location.pathname : '/dashboard'}
              onSuccess={handleSuccess}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function AuthDialog() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"signin" | "signup">("signup")

  const handleSuccess = () => {
    setOpen(false)
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

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
              <CustomSignIn
                redirectUrl={typeof window !== 'undefined' ? window.location.pathname : '/dashboard'}
                onSuccess={handleSuccess}
              />
            ) : (
              <CustomSignUp
                redirectUrl={typeof window !== 'undefined' ? window.location.pathname : '/onboarding'}
                onSuccess={handleSuccess}
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
