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

  // Strategie 1: Minimum salaris + rest als dividend direct naar privé
  const strategy1 = calculateStrategy1(corporateProfit, desiredNetIncome, minSalary, year)
  strategies.push(strategy1)

  // Strategie 2: Minimum salaris + rest als dividend naar holding (geen dividendbelasting)
  if (hasHolding) {
    const strategy2 = calculateStrategy2(corporateProfit, desiredNetIncome, minSalary, year)
    strategies.push(strategy2)
  }

  // Strategie 3: Meer salaris als nodig voor gewenst netto inkomen
  const strategy3 = calculateStrategy3(corporateProfit, desiredNetIncome, minSalary, year)
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

function calculateStrategy1(
  corporateProfit: number,
  desiredNetIncome: number,
  minSalary: number,
  year: TaxYear
): OptimizationStrategy {
  const rates = getTaxRates(year)
  
  // Start met minimum salaris
  const salary = Math.min(minSalary, corporateProfit)
  let netIncome = 0
  let dividendToPrivate = 0
  let isFeasible = false

  // Bereken netto inkomen met alleen minimum salaris
  const salaryTax = calculateIncomeTax(salary, year)
  const netFromSalary = salary - salaryTax

  if (netFromSalary >= desiredNetIncome) {
    // Alleen salaris is genoeg
    isFeasible = true
    netIncome = netFromSalary
  } else {
    // We hebben dividend nodig
    const neededNetFromDividend = desiredNetIncome - netFromSalary
    // Netto dividend = bruto dividend * (1 - dividendbelasting)
    dividendToPrivate = neededNetFromDividend / (1 - rates.dividendTax.rate)
    
    // Check of er genoeg winst is
    const profitAfterSalary = Math.max(0, corporateProfit - salary)
    const corporateTax = calculateCorporateTaxAmount(profitAfterSalary, year)
    const availableAfterTax = profitAfterSalary - corporateTax

    if (dividendToPrivate <= availableAfterTax) {
      isFeasible = true
      netIncome = netFromSalary + neededNetFromDividend
    } else {
      // Niet haalbaar met deze strategie
      dividendToPrivate = availableAfterTax
      const dividendTax = dividendToPrivate * rates.dividendTax.rate
      netIncome = netFromSalary + (dividendToPrivate - dividendTax)
    }
  }

  const profitAfterSalary = Math.max(0, corporateProfit - salary)
  const corporateTax = calculateCorporateTaxAmount(profitAfterSalary, year)
  const dividendTax = dividendToPrivate * rates.dividendTax.rate
  const totalTax = corporateTax + salaryTax + dividendTax
  const availableAfterTax = profitAfterSalary - corporateTax
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
    isFeasible
  }
}

function calculateStrategy2(
  corporateProfit: number,
  desiredNetIncome: number,
  minSalary: number,
  year: TaxYear
): OptimizationStrategy {
  // Start met minimum salaris
  const salary = Math.min(minSalary, corporateProfit)
  let netIncome = 0
  let dividendToHolding = 0
  let isFeasible = false

  // Bereken netto inkomen met alleen minimum salaris
  const salaryTax = calculateIncomeTax(salary, year)
  const netFromSalary = salary - salaryTax

  if (netFromSalary >= desiredNetIncome) {
    // Alleen salaris is genoeg
    isFeasible = true
    netIncome = netFromSalary
  } else {
    // We hebben meer nodig, maar kunnen dividend naar holding sturen (geen dividendbelasting)
    // Voor nu houden we het bij minimum salaris en rest naar holding
    // De gebruiker kan later uit de holding halen zonder dividendbelasting
    const profitAfterSalary = Math.max(0, corporateProfit - salary)
    const corporateTax = calculateCorporateTaxAmount(profitAfterSalary, year)
    const availableAfterTax = profitAfterSalary - corporateTax
    dividendToHolding = availableAfterTax
    
    // Netto inkomen is alleen van salaris (dividend blijft in holding)
    netIncome = netFromSalary
    
    // Als het gewenste netto inkomen alleen met salaris niet haalbaar is,
    // moeten we meer salaris uitkeren (zie strategie 3)
    if (netFromSalary < desiredNetIncome) {
      isFeasible = false
    } else {
      isFeasible = true
    }
  }

  const profitAfterSalaryFinal = Math.max(0, corporateProfit - salary)
  const corporateTaxFinal = calculateCorporateTaxAmount(profitAfterSalaryFinal, year)
  const dividendTax = 0 // Geen dividendbelasting bij uitkering naar holding
  const totalTax = corporateTaxFinal + salaryTax + dividendTax
  const remainingInBV = 0 // Alles gaat naar holding

  return {
    name: "Minimum salaris + dividend naar holding",
    description: "Minimum DGA salaris met rest als dividend naar holding (geen dividendbelasting)",
    salary,
    dividendToPrivate: 0,
    dividendToHolding,
    salaryTax,
    dividendTax,
    corporateTax: corporateTaxFinal,
    totalTax,
    netIncome,
    remainingInBV,
    isFeasible
  }
}

function calculateStrategy3(
  corporateProfit: number,
  desiredNetIncome: number,
  minSalary: number,
  year: TaxYear
): OptimizationStrategy {
  // Bereken hoeveel bruto salaris nodig is voor gewenst netto inkomen
  // Dit is een iteratieve benadering
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
  let finalSalaryTax = calculateIncomeTax(salary, year)
  if (!isFeasible) {
    // Gebruik maximum mogelijk salaris
    salary = corporateProfit
    finalSalaryTax = calculateIncomeTax(salary, year)
    netIncome = salary - finalSalaryTax
    isFeasible = netIncome >= desiredNetIncome
  }

  const profitAfterSalary = Math.max(0, corporateProfit - salary)
  const corporateTax = calculateCorporateTaxAmount(profitAfterSalary, year)
  const dividendTax = 0
  const totalTax = corporateTax + finalSalaryTax + dividendTax
  const availableAfterTax = profitAfterSalary - corporateTax
  const remainingInBV = availableAfterTax

  return {
    name: "Meer salaris voor gewenst netto inkomen",
    description: "Verhoogd salaris om gewenst netto inkomen te behalen",
    salary,
    dividendToPrivate: 0,
    dividendToHolding: 0,
    salaryTax: finalSalaryTax,
    dividendTax,
    corporateTax,
    totalTax,
    netIncome,
    remainingInBV,
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
    advice.push(`Dividend naar holding: €${Math.round(bestStrategy.dividendToHolding).toLocaleString('nl-NL')} (geen dividendbelasting)`)
  }

  if (bestStrategy.remainingInBV > 0) {
    advice.push(`Resterend in BV: €${Math.round(bestStrategy.remainingInBV).toLocaleString('nl-NL')}`)
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

  if (hasHolding && bestStrategy.dividendToHolding === 0) {
    advice.push("Tip: Overweeg dividend naar holding uit te keren voor belastinguitstel")
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
