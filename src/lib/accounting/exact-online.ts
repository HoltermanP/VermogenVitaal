import { AccountingProvider } from "./base-provider"
import type {
  AuthResult,
  FetchParams,
  ProviderConfig,
} from "./types"
import type { Transaction } from "@/lib/audit-service"

export class ExactOnlineProvider extends AccountingProvider {
  name = "EXACT_ONLINE"
  displayName = "Exact Online"
  authType: "oauth" | "api_key" | "both" = "oauth"

  private readonly authBaseUrl = "https://start.exactonline.nl/api/oauth2"
  private readonly apiBaseUrl = "https://start.exactonline.nl/api/v1"

  constructor(config: ProviderConfig) {
    super(config)
  }

  getAuthorizationUrl(state: string): string {
    if (!this.config.clientId || !this.config.redirectUri) {
      throw new Error("Client ID en Redirect URI zijn vereist")
    }

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      state,
      force_login: "0",
    })

    return `${this.authBaseUrl}/auth?${params.toString()}`
  }

  async exchangeCodeForTokens(code: string): Promise<AuthResult> {
    if (!this.config.clientId || !this.config.clientSecret || !this.config.redirectUri) {
      throw new Error("Client ID, Secret en Redirect URI zijn vereist")
    }

    const response = await fetch(`${this.authBaseUrl}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: this.config.redirectUri,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token exchange mislukt: ${error}`)
    }

    const data = await response.json()
    const expiresAt = data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : undefined

    // Haal company ID op
    const companyId = await this.getCompanyId(data.access_token)

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
      companyId: companyId || undefined,
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthResult> {
    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error("Client ID en Secret zijn vereist")
    }

    const response = await fetch(`${this.authBaseUrl}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token refresh mislukt: ${error}`)
    }

    const data = await response.json()
    const expiresAt = data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : undefined

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
    }
  }

  async getCompanyId(accessToken: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/current/Me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      )

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.d?.results?.[0]?.CurrentDivision?.toString() || null
    } catch {
      return null
    }
  }

  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/current/Me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      )
      return response.ok
    } catch {
      return false
    }
  }

  async fetchTransactions(
    accessToken: string,
    params: FetchParams
  ): Promise<Transaction[]> {
    const companyId = await this.getCompanyId(accessToken)
    if (!companyId) {
      throw new Error("Company ID niet gevonden")
    }

    const startDate = params.startDate
      ? params.startDate.toISOString().split("T")[0]
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]
    const endDate = params.endDate
      ? params.endDate.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]

    const limit = params.limit || 100
    const offset = params.offset || 0

    // Exact Online gebruikt GLTransactions endpoint
    const url = `${this.apiBaseUrl}/${companyId}/financialtransaction/GLTransactions?$select=EntryNumber,TransactionDate,Description,AmountFC,Currency,JournalCode&$filter=TransactionDate ge datetime'${startDate}' and TransactionDate le datetime'${endDate}'&$orderby=TransactionDate desc&$top=${limit}&$skip=${offset}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Ophalen transacties mislukt: ${error}`)
    }

    const data = await response.json()
    const transactions = data.d?.results || []

    return transactions.map((t: unknown) => this.mapTransaction(t))
  }

  protected mapTransaction(rawTransaction: any): Transaction {
    return {
      datum: rawTransaction.TransactionDate
        ? new Date(rawTransaction.TransactionDate).toISOString().split("T")[0]
        : "",
      omschrijving: rawTransaction.Description || "",
      bedrag: rawTransaction.AmountFC || 0,
      type: rawTransaction.JournalCode || "",
      categorie: rawTransaction.JournalCode || "",
      factuur: rawTransaction.EntryNumber?.toString() || "",
    }
  }
}

