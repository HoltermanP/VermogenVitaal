import type {
  AuthResult,
  FetchParams,
  ProviderConfig,
  SyncResult,
} from "./types"
import type { Transaction } from "@/lib/audit-service"

export abstract class AccountingProvider {
  abstract name: string
  abstract displayName: string
  abstract authType: "oauth" | "api_key" | "both"

  protected config: ProviderConfig

  constructor(config: ProviderConfig) {
    this.config = config
  }

  /**
   * Genereer OAuth authorization URL
   */
  abstract getAuthorizationUrl(state: string): string

  /**
   * Wissel authorization code om voor tokens
   */
  abstract exchangeCodeForTokens(
    code: string
  ): Promise<AuthResult>

  /**
   * Verfris access token met refresh token
   */
  abstract refreshAccessToken(
    refreshToken: string
  ): Promise<AuthResult>

  /**
   * Haal transacties op uit het boekhoudpakket
   */
  abstract fetchTransactions(
    accessToken: string,
    params: FetchParams
  ): Promise<Transaction[]>

  /**
   * Haal company/division ID op (voor multi-tenant systemen)
   */
  abstract getCompanyId(accessToken: string): Promise<string | null>

  /**
   * Valideer of token nog geldig is
   */
  abstract validateToken(accessToken: string): Promise<boolean>

  /**
   * Converteer provider-specifieke transactie naar standaard formaat
   */
  protected abstract mapTransaction(
    rawTransaction: unknown
  ): Transaction

  /**
   * Sync transacties - wrapper functie
   */
  async sync(
    accessToken: string,
    params: FetchParams
  ): Promise<SyncResult> {
    try {
      const transactions = await this.fetchTransactions(accessToken, params)
      return {
        success: true,
        transactions,
        count: transactions.length,
      }
    } catch (error) {
      return {
        success: false,
        transactions: [],
        count: 0,
        error:
          error instanceof Error ? error.message : "Onbekende fout",
      }
    }
  }
}

