import { AccountingProvider } from "./base-provider"
import { ExactOnlineProvider } from "./exact-online"
import { MoneybirdProvider } from "./moneybird"
import { EBoekhoudenProvider } from "./e-boekhouden"
import type { ProviderConfig } from "./types"

export function createProvider(
  providerName: string,
  config: ProviderConfig
): AccountingProvider {
  switch (providerName.toUpperCase()) {
    case "EXACT_ONLINE":
      return new ExactOnlineProvider(config)
    case "MONEYBIRD":
      return new MoneybirdProvider(config)
    case "E_BOEKHOUDEN":
    case "E-BOEKHOUDEN":
      return new EBoekhoudenProvider(config)
    default:
      throw new Error(`Onbekende provider: ${providerName}`)
  }
}

export function getProviderConfig(providerName: string): ProviderConfig {
  const envPrefix = providerName.toUpperCase().replace("-", "_")

  return {
    clientId: process.env[`${envPrefix}_CLIENT_ID`],
    clientSecret: process.env[`${envPrefix}_CLIENT_SECRET`],
    redirectUri: process.env[`${envPrefix}_REDIRECT_URI`] ||
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/accounting/callback`,
    apiKey: process.env[`${envPrefix}_API_KEY`],
    apiSecret: process.env[`${envPrefix}_API_SECRET`],
    baseUrl: process.env[`${envPrefix}_BASE_URL`],
  }
}

export const PROVIDER_INFO = {
  EXACT_ONLINE: {
    name: "Exact Online",
    description: "Koppel met je Exact Online administratie",
    authType: "oauth",
    logo: "📊",
  },
  MONEYBIRD: {
    name: "Moneybird",
    description: "Koppel met je Moneybird administratie",
    authType: "oauth",
    logo: "💰",
  },
  E_BOEKHOUDEN: {
    name: "e-Boekhouden",
    description: "Koppel met je e-Boekhouden administratie via API key",
    authType: "api_key",
    logo: "📈",
  },
} as const

