"use client"

import { CustomSignIn } from "@/components/custom-sign-in"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Inloggen</CardTitle>
          <CardDescription>
            Log in op je account om verder te gaan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomSignIn redirectUrl="/dashboard" />
        </CardContent>
      </Card>
    </div>
  )
}

