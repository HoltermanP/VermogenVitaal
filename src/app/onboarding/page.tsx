"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { z } from "zod"
import { Building, User, Target, Shield } from "lucide-react"

const onboardingSchema = z.object({
  // Step 1: Profile
  legalForm: z.enum(['EMZ', 'BV', 'DGA']),
  revenue: z.number().min(0, "Omzet moet positief zijn"),
  salary: z.number().min(0, "Salaris moet positief zijn"),
  assets: z.number().min(0, "Vermogen moet positief zijn"),
  
  // Step 2: Goals
  goals: z.array(z.string()).min(1, "Selecteer minimaal één doel"),
  
  // Step 3: Risk Profile
  riskProfile: z.enum(['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE']),
  timeHorizon: z.number().min(1, "Beleggingshorizon moet minimaal 1 jaar zijn"),
  
  // Step 4: Permissions
  acceptTerms: z.boolean().refine(val => val === true, "Je moet akkoord gaan met de voorwaarden"),
  acceptPrivacy: z.boolean().refine(val => val === true, "Je moet akkoord gaan met het privacybeleid"),
  acceptMarketing: z.boolean().optional()
})

type OnboardingForm = z.infer<typeof onboardingSchema>

const goals = [
  { id: 'pension', label: 'Pensioenopbouw', description: 'Voorbereiden op pensioen' },
  { id: 'wealth', label: 'Vermogensopbouw', description: 'Vermogen laten groeien' },
  { id: 'tax', label: 'Fiscale optimalisatie', description: 'Belastingen optimaliseren' },
  { id: 'investment', label: 'Beleggen', description: 'Investeren in aandelen/ETF\'s' },
  { id: 'real_estate', label: 'Vastgoed', description: 'Investeren in vastgoed' },
  { id: 'crypto', label: 'Crypto (educatief)', description: 'Leren over cryptocurrency' }
]

const riskProfiles = [
  {
    value: 'CONSERVATIVE',
    label: 'Conservatief',
    description: 'Laag risico, stabiele groei',
    color: 'bg-green-100 text-green-800'
  },
  {
    value: 'MODERATE',
    label: 'Gematigd',
    description: 'Gebalanceerd risico en rendement',
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    value: 'AGGRESSIVE',
    label: 'Agressief',
    description: 'Hoog risico, hoog potentieel rendement',
    color: 'bg-red-100 text-red-800'
  }
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      legalForm: 'EMZ',
      revenue: 0,
      salary: 0,
      assets: 0,
      goals: [],
      riskProfile: 'MODERATE',
      timeHorizon: 10,
      acceptTerms: false,
      acceptPrivacy: false,
      acceptMarketing: false
    }
  })

  const onSubmit = async (data: OnboardingForm) => {
    setIsSubmitting(true)
    try {
      // In production, this would save to the database
      console.log('Onboarding data:', data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to dashboard
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Onboarding error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = (currentStep / 4) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welkom bij Tax & Wealth Hub
            </h1>
            <p className="text-lg text-gray-600">
              Laten we je profiel opzetten voor gepersonaliseerde adviezen
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle>Stap {currentStep} van 4</CardTitle>
                  <CardDescription>
                    {currentStep === 1 && "Basis profiel"}
                    {currentStep === 2 && "Doelen en interesses"}
                    {currentStep === 3 && "Risicoprofiel"}
                    {currentStep === 4 && "Toestemmingen"}
                  </CardDescription>
                </div>
                <Badge variant="outline">{Math.round(progress)}%</Badge>
              </div>
              <Progress value={progress} className="h-2" />
            </CardHeader>

            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Profile */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="legalForm">Rechtsvorm</Label>
                      <Select {...form.register("legalForm")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer je rechtsvorm" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EMZ">Eenmanszaak (EMZ)</SelectItem>
                          <SelectItem value="BV">Besloten Vennootschap (BV)</SelectItem>
                          <SelectItem value="DGA">DGA (Directeur-Grootaandeelhouder)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="revenue">Jaaromzet (€)</Label>
                        <Input
                          id="revenue"
                          type="number"
                          {...form.register("revenue", { valueAsNumber: true })}
                          placeholder="100000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="salary">Salaris (€)</Label>
                        <Input
                          id="salary"
                          type="number"
                          {...form.register("salary", { valueAsNumber: true })}
                          placeholder="50000"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="assets">Vermogen (€)</Label>
                      <Input
                        id="assets"
                        type="number"
                        {...form.register("assets", { valueAsNumber: true })}
                        placeholder="50000"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Goals */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <Label>Wat zijn je doelen? (selecteer alle van toepassing)</Label>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {goals.map((goal) => (
                          <div key={goal.id} className="flex items-start space-x-3">
                            <Checkbox
                              id={goal.id}
                              {...form.register("goals")}
                              value={goal.id}
                            />
                            <div className="grid gap-1.5 leading-none">
                              <Label htmlFor={goal.id} className="text-sm font-medium">
                                {goal.label}
                              </Label>
                              <p className="text-xs text-gray-500">
                                {goal.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Risk Profile */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <Label>Risicoprofiel</Label>
                      <div className="grid gap-4 mt-4">
                        {riskProfiles.map((profile) => (
                          <div key={profile.value} className="flex items-start space-x-3">
                            <input
                              type="radio"
                              id={profile.value}
                              {...form.register("riskProfile")}
                              value={profile.value}
                              className="mt-1"
                            />
                            <div className="grid gap-1.5 leading-none">
                              <Label htmlFor={profile.value} className="text-sm font-medium">
                                {profile.label}
                              </Label>
                              <p className="text-xs text-gray-500">
                                {profile.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="timeHorizon">Beleggingshorizon (jaren)</Label>
                      <Input
                        id="timeHorizon"
                        type="number"
                        {...form.register("timeHorizon", { valueAsNumber: true })}
                        placeholder="10"
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Permissions */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="acceptTerms"
                          {...form.register("acceptTerms")}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="acceptTerms" className="text-sm font-medium">
                            Ik ga akkoord met de algemene voorwaarden
                          </Label>
                          <p className="text-xs text-gray-500">
                            <a href="/legal/terms" className="text-blue-600 hover:underline">
                              Lees de algemene voorwaarden
                            </a>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="acceptPrivacy"
                          {...form.register("acceptPrivacy")}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="acceptPrivacy" className="text-sm font-medium">
                            Ik ga akkoord met het privacybeleid
                          </Label>
                          <p className="text-xs text-gray-500">
                            <a href="/legal/privacy" className="text-blue-600 hover:underline">
                              Lees het privacybeleid
                            </a>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="acceptMarketing"
                          {...form.register("acceptMarketing")}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="acceptMarketing" className="text-sm font-medium">
                            Ik wil updates ontvangen over nieuwe features (optioneel)
                          </Label>
                          <p className="text-xs text-gray-500">
                            Je kunt dit later altijd aanpassen in je account
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    Vorige
                  </Button>

                  {currentStep < 4 ? (
                    <Button type="button" onClick={nextStep}>
                      Volgende
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Opslaan..." : "Voltooi profiel"}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
