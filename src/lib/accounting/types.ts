import type { Transaction } from "@/lib/audit-service"

export interface AuthResult {
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  companyId?: string
}

export interface FetchParams {
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

export interface ProviderConfig {
  clientId?: string
  clientSecret?: string
  redirectUri?: string
  apiKey?: string
  apiSecret?: string
  baseUrl?: string
}

export interface OAuthState {
  provider: string
  userId: string
  returnUrl?: string
}

export interface SyncResult {
  success: boolean
  transactions: Transaction[]
  count: number
  error?: string
}

