export interface EarlyRetirementInput {
  currentAge: number
  desiredRetirementAge: number
  standardRetirementAge: number
  currentSavings: number
  annualSavings: number
  annualExpenses: number
  expectedReturn: number
  inflationRate: number
}

export interface EarlyRetirementResult {
  yearsEarly: number
  requiredSavings: number
  projectedSavings: number
  shortfall: number
  additionalMonthlySavings: number
  possibleRetirementAge: number
  advice: string[]
}

export function calculateEarlyRetirement(input: EarlyRetirementInput): EarlyRetirementResult {
  const {
    currentAge,
    desiredRetirementAge,
    standardRetirementAge = 67,
    currentSavings,
    annualSavings,
    annualExpenses,
    expectedReturn = 0.05,
    inflationRate = 0.02
  } = input

  const yearsEarly = desiredRetirementAge - standardRetirementAge
  const yearsToDesiredRetirement = desiredRetirementAge - currentAge

  // Geïndexeerde uitgaven bij gewenste pensioenleeftijd
  const futureExpenses = annualExpenses * Math.pow(1 + inflationRate, yearsToDesiredRetirement)
  
  // Benodigd vermogen (25x jaarlijkse uitgaven - FIRE regel)
  const requiredSavings = futureExpenses * 25

  // Projected savings bij gewenste pensioenleeftijd
  const projectedSavings = currentSavings * Math.pow(1 + expectedReturn, yearsToDesiredRetirement) +
    annualSavings * (((Math.pow(1 + expectedReturn, yearsToDesiredRetirement) - 1) / expectedReturn))

  const shortfall = Math.max(0, requiredSavings - projectedSavings)

  // Extra maandelijkse inleg nodig
  let additionalMonthlySavings = 0
  if (shortfall > 0) {
    const monthlyReturn = expectedReturn / 12
    const monthsToRetirement = yearsToDesiredRetirement * 12
    additionalMonthlySavings = shortfall / (((Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn))
  }

  // Mogelijke pensioenleeftijd met huidige spaarplan
  let possibleRetirementAge = standardRetirementAge
  if (projectedSavings >= requiredSavings) {
    // Bepaal wanneer we genoeg hebben
    for (let age = currentAge; age <= standardRetirementAge; age++) {
      const years = age - currentAge
      const projected = currentSavings * Math.pow(1 + expectedReturn, years) +
        annualSavings * (((Math.pow(1 + expectedReturn, years) - 1) / expectedReturn))
      const needed = annualExpenses * Math.pow(1 + inflationRate, years) * 25
      if (projected >= needed) {
        possibleRetirementAge = age
        break
      }
    }
  }

  const advice: string[] = []
  if (shortfall > 0) {
    advice.push(`Je hebt een tekort van €${Math.round(shortfall).toLocaleString('nl-NL')}`)
    advice.push(`Spaar extra €${Math.round(additionalMonthlySavings).toLocaleString('nl-NL')} per maand`)
  } else {
    advice.push("Je bent op koers voor vroegpensioen!")
  }

  if (yearsEarly > 5) {
    advice.push("Vroegpensioen vereist substantiële spaarinspanning")
  }

  if (possibleRetirementAge < desiredRetirementAge) {
    advice.push(`Met huidige spaarplan kun je mogelijk al met ${possibleRetirementAge} jaar met pensioen`)
  }

  return {
    yearsEarly,
    requiredSavings,
    projectedSavings,
    shortfall,
    additionalMonthlySavings,
    possibleRetirementAge,
    advice
  }
}




