declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      tier: 'FREE' | 'PREMIUM'
      role: 'USER' | 'ADMIN'
      isTrialActive?: boolean
      trialEndsAt?: Date | null
    }
  }

  interface User {
    tier: 'FREE' | 'PREMIUM'
    role: 'USER' | 'ADMIN'
    isTrialActive?: boolean
    trialEndsAt?: Date | null
  }
}
