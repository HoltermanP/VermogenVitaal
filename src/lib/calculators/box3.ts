import { getTaxRates, type TaxYear } from "../tax-rates"

export interface Box3Input {
  bankSavings: number
  investments: number
  otherAssets?: number
  debts?: number
  hasPartner?: boolean
  year?: TaxYear
}

export interface Box3Result {
  assets: {
    bankSavings: number
    investments: number
    otherAssets: number
    total: number
  }
  debts: number
  netAssets: number
  taxFreeAmount: number
  taxableAssets: number
  assumedReturns: {
    bankSavings: number
    investments: number
    debts: number
    total: number
  }
  box3Tax: number
  effectiveRate: number
}

export function calculateBox3(input: Box3Input): Box3Result {
  const {
    bankSavings = 0,
    investments = 0,
    otherAssets = 0,
    debts = 0,
    hasPartner = false,
    year = 2025
  } = {
    ...input,
    otherAssets: input.otherAssets ?? 0,
    debts: input.debts ?? 0
  }

  const rates = getTaxRates(year).box3

  // Bezittingen
  const assets = {
    bankSavings,
    investments,
    otherAssets,
    total: bankSavings + investments + otherAssets
  }

  // Netto vermogen
  const netAssets = Math.max(0, assets.total - debts)

  // Heffingsvrije voet (jaar-specifiek)
  const taxFreeAmount = hasPartner ? rates.taxFreeAmount.partner : rates.taxFreeAmount.single

  // Belastbaar vermogen
  const taxableAssets = Math.max(0, netAssets - taxFreeAmount)

  // Forfaitair rendement (jaar-specifiek)
  const assumedReturns = {
    bankSavings: bankSavings * rates.assumedReturns.bankSavings,
    investments: investments * rates.assumedReturns.investments,
    debts: debts * rates.assumedReturns.debts,
    total: 0
  }
  assumedReturns.total = assumedReturns.bankSavings + assumedReturns.investments - assumedReturns.debts

  // Box 3 belasting (jaar-specifiek tarief)
  const box3Tax = taxableAssets > 0 ? Math.max(0, assumedReturns.total * rates.taxRate) : 0

  // Effectief tarief
  const effectiveRate = netAssets > 0 ? (box3Tax / netAssets) * 100 : 0

  return {
    assets,
    debts,
    netAssets,
    taxFreeAmount,
    taxableAssets,
    assumedReturns,
    box3Tax,
    effectiveRate
  }
}

