"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, ReactNode, cloneElement, isValidElement } from "react"
import { CustomSignIn } from "@/components/custom-sign-in"
import { CustomSignUp } from "@/components/custom-sign-up"

interface SignInDialogProps {
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SignInDialog({ trigger, open: controlledOpen, onOpenChange: controlledOnOpenChange }: SignInDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  const handleSuccess = () => {
    setOpen(false)
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  const handleOpen = () => setOpen(true)

  const defaultTrigger = (
    <Button
      variant="outline"
      onClick={handleOpen}
      className="border-primary/50 hover:bg-primary/10 hover:border-primary"
    >
      Inloggen
    </Button>
  )

  // Clone trigger en voeg onClick toe als het een React element is
  const triggerElement = trigger 
    ? (isValidElement(trigger) 
        ? cloneElement(trigger as React.ReactElement<{ onClick?: () => void }>, { onClick: handleOpen })
        : trigger)
    : defaultTrigger

  return (
    <>
      {triggerElement}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent">
          <Card className="w-full border-border shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Inloggen</CardTitle>
              <CardDescription>
                Log in op je account om verder te gaan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomSignIn
                redirectUrl={typeof window !== 'undefined' ? window.location.pathname : '/dashboard'}
                onSuccess={handleSuccess}
              />
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface AuthDialogProps {
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultMode?: "signin" | "signup"
}

export function AuthDialog({ trigger, open: controlledOpen, onOpenChange: controlledOnOpenChange, defaultMode = "signup" }: AuthDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  const handleSuccess = () => {
    setOpen(false)
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  const handleOpen = () => setOpen(true)

  const defaultTrigger = (
    <Button
      className="gradient-financial text-white shadow-financial hover:shadow-financial-lg"
      onClick={handleOpen}
    >
      Aanmelden
    </Button>
  )

  // Clone trigger en voeg onClick toe als het een React element is
  const triggerElement = trigger 
    ? (isValidElement(trigger) 
        ? cloneElement(trigger as React.ReactElement<{ onClick?: () => void }>, { onClick: handleOpen })
        : trigger)
    : defaultTrigger

  return (
    <>
      {triggerElement}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent">
          <Card className="w-full border-border shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                {mode === "signin" ? "Inloggen" : "Account aanmaken"}
              </CardTitle>
              <CardDescription>
                {mode === "signin" 
                  ? "Log in op je account om verder te gaan"
                  : "Maak een account aan om te beginnen"}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  )
}
