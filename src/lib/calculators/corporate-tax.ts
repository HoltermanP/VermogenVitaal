import { getTaxRates, type TaxYear } from "../tax-rates"

export interface CorporateTaxInput {
  profit: number
  useMKBExemption?: boolean
  useInnovationBox?: boolean
  innovationProfit?: number
  year?: TaxYear
}

export interface CorporateTaxResult {
  grossProfit: number
  mkbExemption: number
  innovationBoxExemption: number
  taxableProfit: number
  corporateTax: {
    bracket1: number
    bracket2: number
    total: number
  }
  effectiveRate: number
  netProfit: number
  advice: string[]
}

export function calculateCorporateTax(input: CorporateTaxInput): CorporateTaxResult {
  const {
    profit,
    useMKBExemption = false,
    useInnovationBox = false,
    innovationProfit = 0,
    year = 2025
  } = input

  const rates = getTaxRates(year).corporateTax

  let taxableProfit = profit

  // MKB-winstvrijstelling
  const mkbExemption = useMKBExemption && profit <= rates.bracket1Limit 
    ? Math.min(profit * rates.mkbExemptionRate, rates.mkbExemptionMax) 
    : 0

  // Innovatiebox
  const innovationBoxProfit = useInnovationBox 
    ? Math.min(innovationProfit, rates.innovationBoxMax) 
    : 0
  const innovationBoxExemption = innovationBoxProfit > 0 
    ? innovationBoxProfit * (rates.bracket1Rate - rates.innovationBoxRate)
    : 0

  // Belastbare winst
  taxableProfit = profit - mkbExemption

  // VPB berekening
  let bracket1 = 0
  let bracket2 = 0

  if (taxableProfit <= rates.bracket1Limit) {
    bracket1 = taxableProfit * rates.bracket1Rate
  } else {
    bracket1 = rates.bracket1Limit * rates.bracket1Rate
    bracket2 = (taxableProfit - rates.bracket1Limit) * rates.bracket2Rate
  }

  // Innovatiebox korting
  const innovationBoxTax = innovationBoxProfit > 0 
    ? innovationBoxProfit * rates.innovationBoxRate 
    : 0

  const totalCorporateTax = bracket1 + bracket2 - innovationBoxExemption + innovationBoxTax

  // Effectief tarief
  const effectiveRate = profit > 0 ? (totalCorporateTax / profit) * 100 : 0

  // Netto winst
  const netProfit = profit - totalCorporateTax

  // Advies
  const advice: string[] = []
  if (mkbExemption > 0) {
    advice.push(`MKB-winstvrijstelling: €${Math.round(mkbExemption).toLocaleString('nl-NL')}`)
    advice.push(`Effectief tarief eerste €200k: ${((rates.bracket1Rate * 0.86) * 100).toFixed(2)}%`)
  }

  if (innovationBoxExemption > 0) {
    advice.push(`Innovatiebox: €${Math.round(innovationBoxProfit).toLocaleString('nl-NL')} tegen ${(rates.innovationBoxRate * 100).toFixed(0)}%`)
    advice.push(`Belastingbesparing: €${Math.round(innovationBoxExemption).toLocaleString('nl-NL')}`)
  }

  if (profit > rates.bracket1Limit && !useMKBExemption) {
    advice.push("Overweeg MKB-winstvrijstelling voor winst tot €200.000")
  }

  return {
    grossProfit: profit,
    mkbExemption,
    innovationBoxExemption,
    taxableProfit,
    corporateTax: {
      bracket1,
      bracket2,
      total: totalCorporateTax
    },
    effectiveRate,
    netProfit,
    advice
  }
}

