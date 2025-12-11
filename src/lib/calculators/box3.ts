export interface Box3Input {
  bankSavings: number
  investments: number
  otherAssets: number
  debts: number
  hasPartner?: boolean
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
    hasPartner = false
  } = input

  // Bezittingen
  const assets = {
    bankSavings,
    investments,
    otherAssets,
    total: bankSavings + investments + otherAssets
  }

  // Netto vermogen
  const netAssets = Math.max(0, assets.total - debts)

  // Heffingsvrije voet 2025
  const taxFreeAmount = hasPartner ? 114000 : 57000

  // Belastbaar vermogen
  const taxableAssets = Math.max(0, netAssets - taxFreeAmount)

  // Forfaitair rendement 2025
  const bankReturnRate = 0.0036 // 0.36%
  const investmentReturnRate = 0.0617 // 6.17%
  const debtReturnRate = 0.0257 // 2.57%

  const assumedReturns = {
    bankSavings: bankSavings * bankReturnRate,
    investments: investments * investmentReturnRate,
    debts: debts * debtReturnRate,
    total: 0
  }
  assumedReturns.total = assumedReturns.bankSavings + assumedReturns.investments - assumedReturns.debts

  // Box 3 belasting (36% over forfaitair rendement)
  // Alleen belasting berekenen als er belastbaar vermogen is
  const box3Tax = taxableAssets > 0 ? Math.max(0, assumedReturns.total * 0.36) : 0

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

