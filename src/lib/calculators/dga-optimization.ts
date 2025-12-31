import { getTaxRates, type TaxYear } from "@/lib/tax-rates"

export interface DGAOptimizationInput {
  corporateProfit: number
  desiredNetIncome: number
  hasHolding?: boolean
  year?: TaxYear
}

export interface OptimizationStrategy {
  name: string
  description: string
  salary: number
  dividendToPrivate: number
  dividendToHolding: number
  salaryTax: number
  dividendTax: number
  corporateTax: number
  totalTax: number
  netIncome: number
  remainingInBV: number
  remainingInHolding: number
  isFeasible: boolean
}

export interface DGAOptimizationResult {
  strategies: OptimizationStrategy[]
  bestStrategy: OptimizationStrategy | null
  advice: string[]
}

export function calculateDGAOptimization(input: DGAOptimizationInput): DGAOptimizationResult {
  const {
    corporateProfit,
    desiredNetIncome,
    hasHolding = false,
    year = 2025
  } = input

  const minSalary = 56000 // Minimum DGA salaris 2025 en 2026

  const strategies: OptimizationStrategy[] = []

  // Strategie 1: Minimum salaris + rest als dividend naar holding (meest gunstig met holding)
  if (hasHolding) {
    const strategy1 = calculateStrategyWithHolding(corporateProfit, desiredNetIncome, minSalary, year)
    strategies.push(strategy1)
  }

  // Strategie 2: Minimum salaris + rest als dividend direct naar privé
  const strategy2 = calculateStrategyDirectDividend(corporateProfit, desiredNetIncome, minSalary, year)
  strategies.push(strategy2)

  // Strategie 3: Meer salaris als nodig voor gewenst netto inkomen
  const strategy3 = calculateStrategyMoreSalary(corporateProfit, desiredNetIncome, minSalary, year)
  strategies.push(strategy3)

  // Vind de beste strategie (laagste belasting die het gewenste netto inkomen levert)
  const feasibleStrategies = strategies.filter(s => s.isFeasible)
  const bestStrategy = feasibleStrategies.length > 0
    ? feasibleStrategies.reduce((best, current) => 
        current.totalTax < best.totalTax ? current : best
      )
    : null

  // Genereer advies
  const advice = generateAdvice(bestStrategy, strategies, minSalary, hasHolding)

  return {
    strategies,
    bestStrategy,
    advice
  }
}

/**
 * Strategie met holding: Minimum salaris + rest naar holding
 * - Salaris wordt betaald via management fee vanuit holding
 * - Dividend van werkmaatschappij naar holding = deelnemingsvrijstelling (geen dividendbelasting)
 * - VPB wordt betaald over winst na management fee
 */
function calculateStrategyWithHolding(
  corporateProfit: number,
  desiredNetIncome: number,
  minSalary: number,
  year: TaxYear
): OptimizationStrategy {
  const rates = getTaxRates(year)
  
  // Minimum DGA salaris (altijd minimum)
  const salary = Math.min(minSalary, corporateProfit)
  
  // Management fee = salaris (kostenpost voor werkmaatschappij)
  const managementFee = salary
  
  // Winst werkmaatschappij na management fee
  const profitAfterManagementFee = Math.max(0, corporateProfit - managementFee)
  
  // VPB over winst na management fee
  const corporateTax = calculateCorporateTaxAmount(profitAfterManagementFee, year)
  
  // Beschikbaar voor dividend naar holding (deelnemingsvrijstelling, geen dividendbelasting)
  const availableForHolding = profitAfterManagementFee - corporateTax
  
  // Netto inkomen van salaris
  const salaryTax = calculateIncomeTax(salary, year)
  const netFromSalary = salary - salaryTax
  
  let dividendToPrivate = 0
  let dividendTax = 0
  let netIncome = netFromSalary
  let remainingInHolding = availableForHolding
  let isFeasible = false

  if (netFromSalary >= desiredNetIncome) {
    // Alleen salaris is genoeg
    isFeasible = true
  } else {
    // We hebben meer nodig - kan dividend van holding naar privé
    const neededNetFromDividend = desiredNetIncome - netFromSalary
    // Netto dividend = bruto dividend * (1 - dividendbelasting)
    dividendToPrivate = neededNetFromDividend / (1 - rates.dividendTax.rate)
    
    if (dividendToPrivate <= availableForHolding) {
      // Haalbaar
      isFeasible = true
      dividendTax = dividendToPrivate * rates.dividendTax.rate
      netIncome = netFromSalary + neededNetFromDividend
      remainingInHolding = availableForHolding - dividendToPrivate
    } else {
      // Niet haalbaar met deze strategie
      dividendToPrivate = availableForHolding
      dividendTax = dividendToPrivate * rates.dividendTax.rate
      netIncome = netFromSalary + (dividendToPrivate - dividendTax)
      remainingInHolding = 0
    }
  }

  const totalTax = corporateTax + salaryTax + dividendTax

  return {
    name: "Minimum salaris + dividend naar holding",
    description: "Minimum DGA salaris via holding, rest als dividend naar holding (deelnemingsvrijstelling)",
    salary,
    dividendToPrivate,
    dividendToHolding: availableForHolding - dividendToPrivate,
    salaryTax,
    dividendTax,
    corporateTax,
    totalTax,
    netIncome,
    remainingInBV: 0, // Alles gaat naar holding
    remainingInHolding,
    isFeasible
  }
}

/**
 * Strategie zonder holding: Minimum salaris + dividend direct naar privé
 */
function calculateStrategyDirectDividend(
  corporateProfit: number,
  desiredNetIncome: number,
  minSalary: number,
  year: TaxYear
): OptimizationStrategy {
  const rates = getTaxRates(year)
  
  // Minimum DGA salaris
  const salary = Math.min(minSalary, corporateProfit)
  
  // Winst na salaris (salaris is kostenpost)
  const profitAfterSalary = Math.max(0, corporateProfit - salary)
  
  // VPB over winst na salaris
  const corporateTax = calculateCorporateTaxAmount(profitAfterSalary, year)
  
  // Beschikbaar voor dividend na VPB
  const availableAfterTax = profitAfterSalary - corporateTax
  
  // Netto inkomen van salaris
  const salaryTax = calculateIncomeTax(salary, year)
  const netFromSalary = salary - salaryTax
  
  let dividendToPrivate = 0
  let dividendTax = 0
  let netIncome = netFromSalary
  let isFeasible = false

  if (netFromSalary >= desiredNetIncome) {
    // Alleen salaris is genoeg
    isFeasible = true
  } else {
    // We hebben dividend nodig
    const neededNetFromDividend = desiredNetIncome - netFromSalary
    // Netto dividend = bruto dividend * (1 - dividendbelasting)
    dividendToPrivate = neededNetFromDividend / (1 - rates.dividendTax.rate)
    
    if (dividendToPrivate <= availableAfterTax) {
      isFeasible = true
      dividendTax = dividendToPrivate * rates.dividendTax.rate
      netIncome = netFromSalary + neededNetFromDividend
    } else {
      // Niet haalbaar
      dividendToPrivate = availableAfterTax
      dividendTax = dividendToPrivate * rates.dividendTax.rate
      netIncome = netFromSalary + (dividendToPrivate - dividendTax)
    }
  }

  const totalTax = corporateTax + salaryTax + dividendTax
  const remainingInBV = Math.max(0, availableAfterTax - dividendToPrivate)

  return {
    name: "Minimum salaris + dividend direct",
    description: "Minimum DGA salaris met rest als dividend direct naar privé",
    salary,
    dividendToPrivate,
    dividendToHolding: 0,
    salaryTax,
    dividendTax,
    corporateTax,
    totalTax,
    netIncome,
    remainingInBV,
    remainingInHolding: 0,
    isFeasible
  }
}

/**
 * Strategie: Meer salaris als nodig voor gewenst netto inkomen
 */
function calculateStrategyMoreSalary(
  corporateProfit: number,
  desiredNetIncome: number,
  minSalary: number,
  year: TaxYear
): OptimizationStrategy {
  // Bereken hoeveel bruto salaris nodig is voor gewenst netto inkomen
  let salary = minSalary
  let netIncome = 0
  let isFeasible = false

  // Probeer verschillende salaris bedragen
  for (let testSalary = minSalary; testSalary <= corporateProfit; testSalary += 1000) {
    const salaryTax = calculateIncomeTax(testSalary, year)
    const netFromSalary = testSalary - salaryTax
    
    if (netFromSalary >= desiredNetIncome) {
      salary = testSalary
      netIncome = netFromSalary
      isFeasible = true
      break
    }
  }

  // Als we het gewenste netto inkomen niet kunnen halen met alleen salaris
  let salaryTax = calculateIncomeTax(salary, year)
  if (!isFeasible) {
    // Gebruik maximum mogelijk salaris
    salary = corporateProfit
    salaryTax = calculateIncomeTax(salary, year)
    netIncome = salary - salaryTax
    isFeasible = netIncome >= desiredNetIncome
  }

  // Winst na salaris
  const profitAfterSalary = Math.max(0, corporateProfit - salary)
  const corporateTax = calculateCorporateTaxAmount(profitAfterSalary, year)
  const dividendTax = 0
  const totalTax = corporateTax + salaryTax + dividendTax
  const availableAfterTax = profitAfterSalary - corporateTax
  const remainingInBV = availableAfterTax

  return {
    name: "Meer salaris voor gewenst netto inkomen",
    description: "Verhoogd salaris om gewenst netto inkomen te behalen",
    salary,
    dividendToPrivate: 0,
    dividendToHolding: 0,
    salaryTax,
    dividendTax,
    corporateTax,
    totalTax,
    netIncome,
    remainingInBV,
    remainingInHolding: 0,
    isFeasible
  }
}

function generateAdvice(
  bestStrategy: OptimizationStrategy | null,
  strategies: OptimizationStrategy[],
  minSalary: number,
  hasHolding: boolean
): string[] {
  const advice: string[] = []

  if (!bestStrategy) {
    advice.push("Het gewenste netto inkomen is niet haalbaar met de huidige winst.")
    return advice
  }

  advice.push(`Aanbevolen strategie: ${bestStrategy.name}`)
  advice.push(`Minimum DGA salaris: €${minSalary.toLocaleString('nl-NL')}`)
  
  if (bestStrategy.salary > minSalary) {
    advice.push(`Salaris: €${Math.round(bestStrategy.salary).toLocaleString('nl-NL')} (boven minimum)`)
  } else {
    advice.push(`Salaris: €${Math.round(bestStrategy.salary).toLocaleString('nl-NL')} (minimum)`)
  }

  if (bestStrategy.dividendToPrivate > 0) {
    advice.push(`Dividend naar privé: €${Math.round(bestStrategy.dividendToPrivate).toLocaleString('nl-NL')}`)
  }

  if (bestStrategy.dividendToHolding > 0) {
    advice.push(`Dividend naar holding: €${Math.round(bestStrategy.dividendToHolding).toLocaleString('nl-NL')} (deelnemingsvrijstelling, geen dividendbelasting)`)
  }

  if (bestStrategy.remainingInBV > 0) {
    advice.push(`Resterend in werkmaatschappij: €${Math.round(bestStrategy.remainingInBV).toLocaleString('nl-NL')}`)
  }

  if (bestStrategy.remainingInHolding > 0) {
    advice.push(`Resterend in holding: €${Math.round(bestStrategy.remainingInHolding).toLocaleString('nl-NL')} (kan worden belegd)`)
  }

  advice.push(`Totaal belasting: €${Math.round(bestStrategy.totalTax).toLocaleString('nl-NL')}`)
  advice.push(`Netto inkomen: €${Math.round(bestStrategy.netIncome).toLocaleString('nl-NL')}`)

  // Vergelijk met andere strategieën
  const otherStrategies = strategies.filter(s => s !== bestStrategy && s.isFeasible)
  if (otherStrategies.length > 0) {
    otherStrategies.forEach(strategy => {
      const taxDifference = strategy.totalTax - bestStrategy.totalTax
      if (taxDifference > 0) {
        advice.push(`Alternatief "${strategy.name}" kost €${Math.round(taxDifference).toLocaleString('nl-NL')} meer belasting`)
      }
    })
  }

  if (hasHolding && bestStrategy.dividendToHolding === 0 && bestStrategy.name !== "Minimum salaris + dividend naar holding") {
    advice.push("Tip: Met een holding kan dividend naar holding worden uitgekeerd met deelnemingsvrijstelling (geen dividendbelasting)")
  }

  return advice
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
