declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      tier: 'FREE' | 'BASIC' | 'PRO' | 'ELITE'
      role: 'USER' | 'ADMIN'
    }
  }

  interface User {
    tier: 'FREE' | 'BASIC' | 'PRO' | 'ELITE'
    role: 'USER' | 'ADMIN'
  }
}
