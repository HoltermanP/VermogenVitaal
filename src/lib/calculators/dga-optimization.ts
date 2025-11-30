export interface DGAOptimizationInput {
  corporateProfit: number
  currentSalary: number
  currentDividend: number
  hasPartner?: boolean
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
    hasPartner = false
  } = input

  // Minimum DGA-salaris 2025
  const minSalary = corporateProfit <= 200000 ? 51000 : 75000

  // Huidige situatie
  const currentCorporateTax = calculateCorporateTaxAmount(corporateProfit)
  const currentAfterCorporateTax = corporateProfit - currentCorporateTax
  const availableForDistribution = currentAfterCorporateTax

  // Huidige belastingen
  const currentSalaryTax = calculateIncomeTax(currentSalary)
  const currentDividendTax = currentDividend * 0.265
  const currentTotalTax = currentCorporateTax + currentSalaryTax + currentDividendTax
  const currentNetIncome = currentSalary + currentDividend - currentSalaryTax - currentDividendTax

  // Geoptimaliseerde situatie
  const optimizedSalary = Math.max(minSalary, currentSalary)
  const optimizedDividend = Math.max(0, availableForDistribution - optimizedSalary)

  const optimizedCorporateTax = calculateCorporateTaxAmount(corporateProfit)
  const optimizedSalaryTax = calculateIncomeTax(optimizedSalary)
  const optimizedDividendTax = optimizedDividend * 0.265
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
    advice.push(`Aanbevolen dividend: €${Math.round(optimizedDividend).toLocaleString('nl-NL')}`)
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

function calculateCorporateTaxAmount(profit: number): number {
  const bracket1Limit = 200000
  const bracket1Rate = 0.19
  const bracket2Rate = 0.258

  if (profit <= bracket1Limit) {
    return profit * bracket1Rate
  } else {
    return bracket1Limit * bracket1Rate + (profit - bracket1Limit) * bracket2Rate
  }
}

function calculateIncomeTax(income: number): number {
  const bracket1Limit = 75518
  const bracket1Rate = 0.3697
  const bracket2Rate = 0.495

  if (income <= bracket1Limit) {
    return income * bracket1Rate
  } else {
    return bracket1Limit * bracket1Rate + (income - bracket1Limit) * bracket2Rate
  }
}

