import { getTaxRates, type TaxYear } from "../tax-rates"

export interface DividendTaxInput {
  dividend: number
  isDGA?: boolean
  salary?: number
  corporateProfit?: number
  year?: TaxYear
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
    corporateProfit = 0,
    year = 2025
  } = input

  const rates = getTaxRates(year)
  const dividendTaxRate = rates.dividendTax.rate
  const corporateRates = rates.corporateTax
  const incomeTaxRates = rates.incomeTax

  const dividendTax = dividend * dividendTaxRate
  const netDividend = dividend - dividendTax

  // Box 2 belasting (ook zelfde tarief)
  const box2Tax = dividend * dividendTaxRate

  // Totale belasting (dividendbelasting is definitief)
  const totalTax = dividendTax

  // Effectief tarief
  const effectiveRate = dividend > 0 ? (totalTax / dividend) * 100 : 0

  // Optimalisatie voor DGA
  let optimization: { recommendedSalary: number; recommendedDividend: number; taxSavings: number } | undefined = undefined

  if (isDGA && corporateProfit > 0) {
    // Minimum DGA-salaris (jaar-specifiek)
    const minSalary = corporateProfit <= corporateRates.dgaMinSalary.threshold 
      ? corporateRates.dgaMinSalary.low 
      : corporateRates.dgaMinSalary.high
    const availableForDividend = Math.max(0, corporateProfit - minSalary)

    // Bereken optimale verhouding
    const recommendedSalary = minSalary
    const recommendedDividend = Math.min(availableForDividend, corporateProfit - recommendedSalary)

    // Belastingbesparing (gebruik gemiddeld inkomstenbelastingtarief)
    const avgIncomeTaxRate = (incomeTaxRates.bracket1Rate + incomeTaxRates.bracket2Rate) / 2
    const currentTotalTax = (salary * avgIncomeTaxRate) + (dividend * dividendTaxRate)
    const optimizedTotalTax = (recommendedSalary * avgIncomeTaxRate) + (recommendedDividend * dividendTaxRate)
    const taxSavings = currentTotalTax - optimizedTotalTax

    optimization = {
      recommendedSalary,
      recommendedDividend,
      taxSavings: Math.max(0, taxSavings)
    }
  }

  // Advies
  const advice: string[] = []
  advice.push(`Dividendbelasting: €${Math.round(dividendTax).toLocaleString('nl-NL')} (${(dividendTaxRate * 100).toFixed(1)}%)`)
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

