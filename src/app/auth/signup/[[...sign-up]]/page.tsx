"use client"

import { CustomSignUp } from "@/components/custom-sign-up"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Account aanmaken</CardTitle>
          <CardDescription>
            Maak een account aan om te beginnen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomSignUp redirectUrl="/onboarding" />
        </CardContent>
      </Card>
    </div>
  )
}
