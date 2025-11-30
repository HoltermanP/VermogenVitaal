export interface DividendTaxInput {
  dividend: number
  isDGA?: boolean
  salary?: number
  corporateProfit?: number
}

export interface DividendTaxResult {
  grossDividend: number
  dividendTax: number
  netDividend: number
  effectiveRate: number
  box2Tax: number
  totalTax: number
  optimization?: {
    recommendedSalary: number
    recommendedDividend: number
    taxSavings: number
  }
  advice: string[]
}

export function calculateDividendTax(input: DividendTaxInput): DividendTaxResult {
  const {
    dividend,
    isDGA = false,
    salary = 0,
    corporateProfit = 0
  } = input

  // Dividendbelasting 2025: 26.5%
  const dividendTaxRate = 0.265
  const dividendTax = dividend * dividendTaxRate
  const netDividend = dividend - dividendTax

  // Box 2 belasting (ook 26.5%)
  const box2Tax = dividend * dividendTaxRate

  // Totale belasting (dividendbelasting is definitief)
  const totalTax = dividendTax

  // Effectief tarief
  const effectiveRate = dividend > 0 ? (totalTax / dividend) * 100 : 0

  // Optimalisatie voor DGA
  let optimization: { recommendedSalary: number; recommendedDividend: number; taxSavings: number } | undefined = undefined

  if (isDGA && corporateProfit > 0) {
    // Minimum DGA-salaris
    const minSalary = corporateProfit <= 200000 ? 51000 : 75000
    const availableForDividend = Math.max(0, corporateProfit - minSalary)

    // Bereken optimale verhouding
    const recommendedSalary = minSalary
    const recommendedDividend = Math.min(availableForDividend, corporateProfit - recommendedSalary)

    // Belastingbesparing
    const currentTotalTax = (salary * 0.37) + (dividend * dividendTaxRate)
    const optimizedTotalTax = (recommendedSalary * 0.37) + (recommendedDividend * dividendTaxRate)
    const taxSavings = currentTotalTax - optimizedTotalTax

    optimization = {
      recommendedSalary,
      recommendedDividend,
      taxSavings: Math.max(0, taxSavings)
    }
  }

  // Advies
  const advice: string[] = []
  advice.push(`Dividendbelasting: €${Math.round(dividendTax).toLocaleString('nl-NL')} (26.5%)`)
  advice.push(`Netto dividend: €${Math.round(netDividend).toLocaleString('nl-NL')}`)

  if (isDGA && optimization) {
    if (optimization.taxSavings > 0) {
      advice.push(`Optimalisatie kan €${Math.round(optimization.taxSavings).toLocaleString('nl-NL')} besparen`)
    }
  }

  return {
    grossDividend: dividend,
    dividendTax,
    netDividend,
    effectiveRate,
    box2Tax,
    totalTax,
    optimization,
    advice
  }
}

