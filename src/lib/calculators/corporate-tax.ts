export interface CorporateTaxInput {
  profit: number
  useMKBExemption?: boolean
  useInnovationBox?: boolean
  innovationProfit?: number
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
    innovationProfit = 0
  } = input

  // Vennootschapsbelasting tarieven 2025
  const bracket1Limit = 200000
  const bracket1Rate = 0.19 // 19%
  const bracket2Rate = 0.258 // 25.8%

  let taxableProfit = profit

  // MKB-winstvrijstelling (14% tot €200.000)
  const mkbExemption = useMKBExemption && profit <= bracket1Limit 
    ? Math.min(profit * 0.14, 28000) 
    : 0

  // Innovatiebox (9% tarief tot €350.000)
  const maxInnovationBox = 350000
  const innovationBoxProfit = useInnovationBox 
    ? Math.min(innovationProfit, maxInnovationBox) 
    : 0
  const innovationBoxExemption = innovationBoxProfit > 0 
    ? innovationBoxProfit * (bracket1Rate - 0.09) // Verschil tussen normaal en 9%
    : 0

  // Belastbare winst
  taxableProfit = profit - mkbExemption

  // VPB berekening
  let bracket1 = 0
  let bracket2 = 0

  if (taxableProfit <= bracket1Limit) {
    bracket1 = taxableProfit * bracket1Rate
  } else {
    bracket1 = bracket1Limit * bracket1Rate
    bracket2 = (taxableProfit - bracket1Limit) * bracket2Rate
  }

  // Innovatiebox korting
  const innovationBoxTax = innovationBoxProfit > 0 
    ? innovationBoxProfit * 0.09 
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
    advice.push(`Effectief tarief eerste €200k: ${((bracket1Rate * 0.86) * 100).toFixed(2)}%`)
  }

  if (innovationBoxExemption > 0) {
    advice.push(`Innovatiebox: €${Math.round(innovationBoxProfit).toLocaleString('nl-NL')} tegen 9%`)
    advice.push(`Belastingbesparing: €${Math.round(innovationBoxExemption).toLocaleString('nl-NL')}`)
  }

  if (profit > bracket1Limit && !useMKBExemption) {
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

