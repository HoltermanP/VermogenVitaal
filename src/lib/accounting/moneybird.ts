import { AccountingProvider } from "./base-provider"
import type {
  AuthResult,
  FetchParams,
  ProviderConfig,
} from "./types"
import type { Transaction } from "@/lib/audit-service"

export class MoneybirdProvider extends AccountingProvider {
  name = "MONEYBIRD"
  displayName = "Moneybird"
  authType: "oauth" | "api_key" | "both" = "oauth"

  private readonly authBaseUrl = "https://moneybird.com/oauth/authorize"
  private readonly tokenUrl = "https://moneybird.com/oauth/token"
  private readonly apiBaseUrl = "https://moneybird.com/api/v2"

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
      scope: "sales_invoices financial_statements bank_settings",
    })

    return `${this.authBaseUrl}?${params.toString()}`
  }

  async exchangeCodeForTokens(code: string): Promise<AuthResult> {
    if (!this.config.clientId || !this.config.clientSecret || !this.config.redirectUri) {
      throw new Error("Client ID, Secret en Redirect URI zijn vereist")
    }

    const response = await fetch(this.tokenUrl, {
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

    // Haal administration ID op
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

    const response = await fetch(this.tokenUrl, {
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
      const response = await fetch(`${this.apiBaseUrl}/administrations.json`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      // Neem de eerste administration (meestal heeft een gebruiker er één)
      return data[0]?.id?.toString() || null
    } catch {
      return null
    }
  }

  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/administrations.json`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })
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
      throw new Error("Administration ID niet gevonden")
    }

    const startDate = params.startDate
      ? params.startDate.toISOString().split("T")[0]
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]
    const endDate = params.endDate
      ? params.endDate.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]

    // Moneybird gebruikt financial_mutations endpoint
    const url = `${this.apiBaseUrl}/${companyId}/financial_mutations.json?filter=period:${startDate}..${endDate}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Ophalen transacties mislukt: ${error}`)
    }

    const data = await response.json()
    const mutations = Array.isArray(data) ? data : data.financial_mutations || []

    return mutations.map((m: unknown) => this.mapTransaction(m))
  }

  protected mapTransaction(rawTransaction: any): Transaction {
    return {
      datum: rawTransaction.date || "",
      omschrijving: rawTransaction.message || rawTransaction.description || "",
      bedrag: rawTransaction.amount || 0,
      type: rawTransaction.type || "",
      categorie: rawTransaction.ledger_account_id?.toString() || "",
      tegenrekening: rawTransaction.contra_account_name || "",
    }
  }
}

