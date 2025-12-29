import { getTaxRates, type TaxYear } from "@/lib/tax-rates"

export interface DGAOptimizationInput {
  corporateProfit: number
  currentSalary: number
  currentDividend: number
  hasPartner?: boolean
  year?: TaxYear
}

export interface DGAOptimizationResult {
  current: {
    salary: number
    dividend: number
    salaryTax: number
    dividendTax: number
    corporateTax: number
    totalTax: number
    netIncome: number
  }
  optimized: {
    salary: number
    dividend: number
    salaryTax: number
    dividendTax: number
    corporateTax: number
    totalTax: number
    netIncome: number
  }
  savings: {
    taxSavings: number
    netIncomeIncrease: number
    percentage: number
  }
  advice: string[]
}

export function calculateDGAOptimization(input: DGAOptimizationInput): DGAOptimizationResult {
  const {
    corporateProfit,
    currentSalary,
    currentDividend,
    year = 2025
  } = input
  // hasPartner is voor toekomstig gebruik maar wordt nu nog niet gebruikt

  const rates = getTaxRates(year)
  const minSalary = corporateProfit <= rates.corporateTax.dgaMinSalary.threshold 
    ? rates.corporateTax.dgaMinSalary.low 
    : rates.corporateTax.dgaMinSalary.high

  // Huidige situatie
  // Salaris is een kostenpost, dus vennootschapsbelasting wordt berekend over (winst - salaris)
  const currentProfitAfterSalary = Math.max(0, corporateProfit - currentSalary)
  const currentCorporateTax = calculateCorporateTaxAmount(currentProfitAfterSalary, year)
  const currentAfterCorporateTax = currentProfitAfterSalary - currentCorporateTax
  const availableForDistribution = currentAfterCorporateTax

  // Huidige belastingen
  const currentSalaryTax = calculateIncomeTax(currentSalary, year)
  const currentDividendTax = currentDividend * rates.dividendTax.rate
  const currentTotalTax = currentCorporateTax + currentSalaryTax + currentDividendTax
  const currentNetIncome = currentSalary + currentDividend - currentSalaryTax - currentDividendTax

  // Geoptimaliseerde situatie
  // Optimaal salaris is altijd het minimum DGA salaris (als er genoeg winst is)
  const optimizedSalary = Math.min(minSalary, corporateProfit)
  // Winst na salaris
  const optimizedProfitAfterSalary = Math.max(0, corporateProfit - optimizedSalary)
  // Vennootschapsbelasting over winst na salaris
  const optimizedCorporateTax = calculateCorporateTaxAmount(optimizedProfitAfterSalary, year)
  // Beschikbaar voor dividend na vennootschapsbelasting
  const optimizedAfterCorporateTax = optimizedProfitAfterSalary - optimizedCorporateTax
  const optimizedDividend = Math.max(0, optimizedAfterCorporateTax)

  const optimizedSalaryTax = calculateIncomeTax(optimizedSalary, year)
  const optimizedDividendTax = optimizedDividend * rates.dividendTax.rate
  const optimizedTotalTax = optimizedCorporateTax + optimizedSalaryTax + optimizedDividendTax
  const optimizedNetIncome = optimizedSalary + optimizedDividend - optimizedSalaryTax - optimizedDividendTax

  // Besparingen
  const taxSavings = currentTotalTax - optimizedTotalTax
  const netIncomeIncrease = optimizedNetIncome - currentNetIncome
  const percentage = currentNetIncome > 0 ? (netIncomeIncrease / currentNetIncome) * 100 : 0

  // Advies
  const advice: string[] = []
  if (currentSalary < minSalary) {
    advice.push(`Minimum DGA-salaris: €${minSalary.toLocaleString('nl-NL')}`)
    advice.push("Je huidige salaris is te laag, dit kan gecorrigeerd worden door de Belastingdienst")
  }

  if (taxSavings > 0) {
    advice.push(`Belastingbesparing: €${Math.round(taxSavings).toLocaleString('nl-NL')} per jaar`)
    advice.push(`Netto inkomen stijgt met: €${Math.round(netIncomeIncrease).toLocaleString('nl-NL')}`)
  } else {
    advice.push("Huidige verhouding is al redelijk geoptimaliseerd")
  }

  if (optimizedDividend > 0) {
    advice.push(`Optimaal dividend: €${Math.round(optimizedDividend).toLocaleString('nl-NL')}`)
  }

  return {
    current: {
      salary: currentSalary,
      dividend: currentDividend,
      salaryTax: currentSalaryTax,
      dividendTax: currentDividendTax,
      corporateTax: currentCorporateTax,
      totalTax: currentTotalTax,
      netIncome: currentNetIncome
    },
    optimized: {
      salary: optimizedSalary,
      dividend: optimizedDividend,
      salaryTax: optimizedSalaryTax,
      dividendTax: optimizedDividendTax,
      corporateTax: optimizedCorporateTax,
      totalTax: optimizedTotalTax,
      netIncome: optimizedNetIncome
    },
    savings: {
      taxSavings,
      netIncomeIncrease,
      percentage
    },
    advice
  }
}

function calculateCorporateTaxAmount(profit: number, year: TaxYear = 2025): number {
  const rates = getTaxRates(year)
  const bracket1Limit = rates.corporateTax.bracket1Limit
  const bracket1Rate = rates.corporateTax.bracket1Rate
  const bracket2Rate = rates.corporateTax.bracket2Rate

  if (profit <= bracket1Limit) {
    return profit * bracket1Rate
  } else {
    return bracket1Limit * bracket1Rate + (profit - bracket1Limit) * bracket2Rate
  }
}

function calculateIncomeTax(income: number, year: TaxYear = 2025): number {
  const rates = getTaxRates(year)
  const bracket1Limit = rates.incomeTax.bracket1Limit
  const bracket1Rate = rates.incomeTax.bracket1Rate
  const bracket2Rate = rates.incomeTax.bracket2Rate

  if (income <= bracket1Limit) {
    return income * bracket1Rate
  } else {
    return bracket1Limit * bracket1Rate + (income - bracket1Limit) * bracket2Rate
  }
}

