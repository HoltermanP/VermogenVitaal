import { BvVsEmzInput } from "@/lib/validations/calculators"

export interface BvVsEmzResult {
  emz: {
    netIncome: number
    totalTax: number
    effectiveRate: number
  }
  bv: {
    netIncome: number
    totalTax: number
    effectiveRate: number
  }
  comparison: {
    difference: number
    percentageDifference: number
    recommendation: string
  }
  sensitivity: {
    revenuePlus10: number
    revenueMinus10: number
  }
  advice: string[]
}

export function calculateBvVsEmz(input: BvVsEmzInput): BvVsEmzResult {
  const {
    revenue,
    costs,
    dgaSalary,
    employerCosts,
    dividend,
    mkbProfitExemption,
    selfEmployedDeduction,
    starterDeduction,
    pension,
    dgaPension
  } = input

  // EMZ berekening
  const emzProfit = revenue - costs
  const emzDeductions = calculateEmzDeductions(emzProfit, selfEmployedDeduction, starterDeduction)
  const emzTaxableIncome = Math.max(0, emzProfit - emzDeductions)
  const emzIncomeTax = calculateIncomeTax(emzTaxableIncome)
  const emzNetIncome = emzProfit - emzIncomeTax

  // BV berekening
  const bvProfit = revenue - costs - dgaSalary - employerCosts
  const bvCorpTax = calculateCorpTax(bvProfit, mkbProfitExemption)
  const bvAfterTax = bvProfit - bvCorpTax
  const bvDividendTax = calculateDividendTax(dividend)
  const bvNetIncome = dgaSalary + dividend - bvDividendTax

  // Totaal belastingdruk
  const emzTotalTax = emzIncomeTax
  const bvTotalTax = bvCorpTax + bvDividendTax + (dgaSalary * 0.52) // Aanname inkomstenbelasting DGA

  // Gevoeligheidsanalyse
  const revenuePlus10 = calculateBvVsEmz({ ...input, revenue: revenue * 1.1 })
  const revenueMinus10 = calculateBvVsEmz({ ...input, revenue: revenue * 0.9 })

  const difference = bvNetIncome - emzNetIncome
  const percentageDifference = (difference / emzNetIncome) * 100

  // Advies
  const advice: string[] = []
  if (difference > 0) {
    advice.push("BV structuur is voordeliger voor uw situatie")
  } else {
    advice.push("EMZ structuur is voordeliger voor uw situatie")
  }

  if (revenue > 100000) {
    advice.push("Bij hoge omzet kan BV structuur voordeliger zijn")
  }

  if (pension > 0) {
    advice.push("Pensioenopbouw via BV kan fiscaal voordelig zijn")
  }

  return {
    emz: {
      netIncome: emzNetIncome,
      totalTax: emzTotalTax,
      effectiveRate: (emzTotalTax / emzProfit) * 100
    },
    bv: {
      netIncome: bvNetIncome,
      totalTax: bvTotalTax,
      effectiveRate: (bvTotalTax / (revenue - costs)) * 100
    },
    comparison: {
      difference,
      percentageDifference,
      recommendation: difference > 0 ? "BV" : "EMZ"
    },
    sensitivity: {
      revenuePlus10: calculateBvVsEmz({ ...input, revenue: revenue * 1.1 }).comparison.difference,
      revenueMinus10: calculateBvVsEmz({ ...input, revenue: revenue * 0.9 }).comparison.difference
    },
    advice
  }
}

function calculateEmzDeductions(profit: number, selfEmployedDeduction: boolean, starterDeduction: boolean): number {
  let deductions = 0
  
  if (selfEmployedDeduction) {
    deductions += Math.min(profit * 0.14, 12200) // Zelfstandigenaftrek 2024
  }
  
  if (starterDeduction) {
    deductions += 2123 // Startersaftrek 2024
  }
  
  return deductions
}

function calculateIncomeTax(taxableIncome: number): number {
  // Vereenvoudigde inkomstenbelasting berekening 2024
  if (taxableIncome <= 75000) {
    return taxableIncome * 0.3695
  } else {
    return 75000 * 0.3695 + (taxableIncome - 75000) * 0.495
  }
}

function calculateCorpTax(profit: number, mkbProfitExemption: boolean): number {
  if (profit <= 0) return 0
  
  let taxableProfit = profit
  if (mkbProfitExemption && profit <= 200000) {
    taxableProfit = profit * 0.76 // MKB-winstvrijstelling
  }
  
  return taxableProfit * 0.259 // VPB tarief 2024
}

function calculateDividendTax(dividend: number): number {
  return dividend * 0.265 // Dividendbelasting 2024
}
