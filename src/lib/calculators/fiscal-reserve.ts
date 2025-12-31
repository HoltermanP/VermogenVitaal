export interface FiscalReserveInput {
  profit: number
  age: number
  reserveType: 'for' | 'investment' | 'both'
  investmentReserveAmount?: number
  yearsUntilRetirement?: number
}

export interface FiscalReserveResult {
  for: {
    maxAmount: number
    recommendedAmount: number
    taxDeferral: number
    available: boolean
  }
  investment: {
    amount: number
    taxDeferral: number
    available: boolean
  }
  totalTaxDeferral: number
  advice: string[]
}

export function calculateFiscalReserve(input: FiscalReserveInput): FiscalReserveResult {
  const {
    profit,
    age,
    reserveType,
    investmentReserveAmount = 0,
    yearsUntilRetirement = 65 - age
  } = input

  // FOR (Fiscale Oudedagsreserve) 2025
  const forMaxAmount = 10000 // Max per jaar (geïndexeerd)
  const forAvailable = age < 65 && profit > 0

  // Aanbevolen FOR bedrag
  const recommendedFOR = forAvailable ? Math.min(forMaxAmount, profit * 0.1) : 0

  // Belastinguitstel FOR
  const forTaxDeferral = recommendedFOR * 0.37 // Gemiddeld tarief

  // Investeringsreserve
  const investmentAvailable = profit > 0 && investmentReserveAmount > 0
  const investmentTaxDeferral = investmentReserveAmount * 0.25 // VPB tarief

  // Totaal belastinguitstel
  const totalTaxDeferral = (reserveType === 'for' || reserveType === 'both' ? forTaxDeferral : 0) +
                           (reserveType === 'investment' || reserveType === 'both' ? investmentTaxDeferral : 0)

  // Advies
  const advice: string[] = []
  
  if (forAvailable) {
    advice.push(`FOR beschikbaar: €${Math.round(recommendedFOR).toLocaleString('nl-NL')} per jaar`)
    advice.push(`Belastinguitstel: €${Math.round(forTaxDeferral).toLocaleString('nl-NL')}`)
    if (yearsUntilRetirement > 0) {
      advice.push(`Tot AOW-leeftijd: ${yearsUntilRetirement} jaar`)
    }
  } else {
    if (age >= 65) {
      advice.push("FOR niet meer beschikbaar na 65e jaar")
    }
  }

  if (investmentAvailable) {
    advice.push(`Investeringsreserve: €${Math.round(investmentReserveAmount).toLocaleString('nl-NL')}`)
    advice.push(`Belastinguitstel: €${Math.round(investmentTaxDeferral).toLocaleString('nl-NL')}`)
  }

  if (totalTaxDeferral > 0) {
    advice.push(`Totaal belastinguitstel: €${Math.round(totalTaxDeferral).toLocaleString('nl-NL')}`)
  }

  return {
    for: {
      maxAmount: forMaxAmount,
      recommendedAmount: recommendedFOR,
      taxDeferral: forTaxDeferral,
      available: forAvailable
    },
    investment: {
      amount: investmentReserveAmount,
      taxDeferral: investmentTaxDeferral,
      available: investmentAvailable
    },
    totalTaxDeferral,
    advice
  }
}

