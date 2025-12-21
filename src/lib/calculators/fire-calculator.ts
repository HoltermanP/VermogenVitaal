export interface FIRECalculatorInput {
  currentAge: number
  currentSavings: number
  annualIncome: number
  annualExpenses: number
  savingsRate: number // Percentage van inkomen dat gespaard wordt
  expectedReturn: number
  withdrawalRate: number // Percentage dat jaarlijks opgenomen wordt (bijv. 4%)
}

export interface FIRECalculatorResult {
  fireNumber: number // Benodigd vermogen voor FIRE
  yearsToFIRE: number
  fireAge: number
  monthlySavings: number
  projectedSavingsAtFIRE: number
  annualWithdrawal: number
  advice: string[]
}

export function calculateFIRE(input: FIRECalculatorInput): FIRECalculatorResult {
  const {
    currentAge,
    currentSavings,
    annualIncome,
    annualExpenses,
    savingsRate = 0.3,
    expectedReturn = 0.07,
    withdrawalRate = 0.04
  } = input

  // FIRE nummer: 25x jaarlijkse uitgaven (4% regel)
  const fireNumber = annualExpenses / withdrawalRate

  // Maandelijkse spaarquote
  const monthlySavings = (annualIncome * savingsRate) / 12

  // Bepaal jaren tot FIRE (iteratief)
  let yearsToFIRE = 0
  let projectedSavings = currentSavings

  for (let year = 1; year <= 100; year++) {
    projectedSavings = projectedSavings * (1 + expectedReturn) + (monthlySavings * 12)
    if (projectedSavings >= fireNumber) {
      yearsToFIRE = year
      break
    }
  }

  const fireAge = currentAge + yearsToFIRE
  const annualWithdrawal = fireNumber * withdrawalRate

  const advice: string[] = []
  if (yearsToFIRE > 0 && yearsToFIRE <= 50) {
    advice.push(`Je kunt financieel onafhankelijk zijn op ${fireAge} jarige leeftijd`)
  } else {
    advice.push("Verhoog je spaarquote of verlaag je uitgaven om FIRE sneller te bereiken")
  }

  if (savingsRate < 0.2) {
    advice.push("Verhoog je spaarquote naar minimaal 20% voor snellere FIRE")
  } else if (savingsRate > 0.5) {
    advice.push("Uitstekende spaarquote! Je bent goed op weg naar FIRE")
  }

  if (withdrawalRate > 0.04) {
    advice.push("Een lagere onttrekkingspercentage (3-4%) geeft meer zekerheid")
  }

  return {
    fireNumber,
    yearsToFIRE,
    fireAge,
    monthlySavings,
    projectedSavingsAtFIRE: projectedSavings,
    annualWithdrawal,
    advice
  }
}











