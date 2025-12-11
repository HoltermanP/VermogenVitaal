export interface HouseSavingsInput {
  currentHouseValue: number
  targetHouseValue: number
  timeHorizonYears: number
  currentSavings: number
  monthlySavings: number
  expectedReturn: number
  purpose: 'buy' | 'renovate' | 'payoff'
  downPaymentPercentage: number
  inflationRate: number
}

export interface HouseSavingsResult {
  requiredDownPayment: number
  totalRequiredCapital: number
  projectedSavings: number
  shortfall: number
  monthlyRequired: number
  timeToReachGoal: number
  inflationImpact: number
  effectiveReturn: number
  mortgageAmount: number
  monthlyMortgagePayment: number
  totalCost: number
  advice: string[]
}

export function calculateHouseSavings(input: HouseSavingsInput): HouseSavingsResult {
  const {
    currentHouseValue,
    targetHouseValue,
    timeHorizonYears,
    currentSavings = 0,
    monthlySavings = 0,
    expectedReturn = 5,
    purpose = 'buy',
    downPaymentPercentage = 20,
    inflationRate = 3
  } = input

  // Verschil berekening
  const priceDifference = Math.max(0, targetHouseValue - currentHouseValue)

  // Eigen geld benodigd gebaseerd op doel
  let requiredDownPayment = 0
  let mortgageAmount = 0

  if (purpose === 'buy') {
    // Aankoop nieuwe woning
    requiredDownPayment = targetHouseValue * (downPaymentPercentage / 100)
    mortgageAmount = targetHouseValue - requiredDownPayment
  } else if (purpose === 'renovate') {
    // Renovatie/verbouwing
    requiredDownPayment = priceDifference
    mortgageAmount = 0
  } else if (purpose === 'payoff') {
    // Extra aflossen huidige hypotheek
    requiredDownPayment = priceDifference
    mortgageAmount = 0
  }

  // Totaal benodigd kapitaal
  const totalRequiredCapital = requiredDownPayment

  // Inflatie impact
  const inflationMultiplier = Math.pow(1 + inflationRate / 100, timeHorizonYears)
  const inflationAdjustedRequired = totalRequiredCapital * inflationMultiplier
  const inflationImpact = Math.round((inflationMultiplier - 1) * 100)

  // Projectie van huidige spaargelden
  const monthlyReturn = expectedReturn / 100 / 12
  let projectedSavings = currentSavings

  // Toekomstwaarde huidige spaargelden
  projectedSavings = currentSavings * Math.pow(1 + expectedReturn / 100, timeHorizonYears)

  // Toekomstwaarde maandelijkse bijdragen
  if (monthlySavings > 0) {
    const months = timeHorizonYears * 12
    const futureValueMonthly = monthlySavings * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) * (1 + monthlyReturn)
    projectedSavings += futureValueMonthly
  }

  // Shortfall
  const shortfall = Math.max(0, inflationAdjustedRequired - projectedSavings)

  // Benodigd maandelijks bedrag
  const months = timeHorizonYears * 12
  const targetWithoutCurrent = inflationAdjustedRequired - currentSavings
  const monthlyRequired = targetWithoutCurrent > 0 ?
    (targetWithoutCurrent * monthlyReturn * Math.pow(1 + monthlyReturn, months)) /
    (Math.pow(1 + monthlyReturn, months) - 1) : 0

  // Tijd tot doel met huidige bijdrage
  let timeToReachGoal = timeHorizonYears
  if (projectedSavings >= inflationAdjustedRequired && monthlySavings > 0) {
    // Bereken exacte tijd
    let balance = currentSavings
    let monthsNeeded = 0

    while (balance < inflationAdjustedRequired && monthsNeeded < months) {
      balance += monthlySavings
      balance *= (1 + monthlyReturn)
      monthsNeeded++
    }

    timeToReachGoal = monthsNeeded / 12
  }

  // Effectief rendement na inflatie
  const realReturn = (1 + expectedReturn / 100) / (1 + inflationRate / 100) - 1
  const effectiveReturn = realReturn * 100

  // Hypotheek berekening (vereenvoudigd)
  const mortgageYears = 30
  const interestRate = 3.5 // Gemiddelde hypotheekrente
  const monthlyMortgagePayment = mortgageAmount > 0 ?
    (mortgageAmount * (interestRate / 100 / 12) * Math.pow(1 + interestRate / 100 / 12, mortgageYears * 12)) /
    (Math.pow(1 + interestRate / 100 / 12, mortgageYears * 12) - 1) : 0

  // Totale kosten
  const totalMortgageCost = monthlyMortgagePayment * mortgageYears * 12
  const totalCost = inflationAdjustedRequired + totalMortgageCost

  // Advies genereren
  const advice: string[] = []

  if (purpose === 'buy') {
    advice.push(`Minimaal ${downPaymentPercentage}% eigen geld (€${Math.round(requiredDownPayment).toLocaleString('nl-NL')}) vereist`)
    if (downPaymentPercentage < 20) {
      advice.push("Let op: lager dan 20% kan leiden tot hogere hypotheekrente")
    }
  }

  if (timeToReachGoal < timeHorizonYears) {
    advice.push(`Doel haalbaar in ${timeToReachGoal.toFixed(1)} jaar - sneller dan gepland!`)
  } else if (shortfall > 0) {
    advice.push(`Verhoog maandelijkse bijdrage naar €${Math.round(monthlyRequired).toLocaleString('nl-NL')}`)
  }

  if (inflationRate > 4) {
    advice.push("Hoge huizenprijsinflatie - doelbedrag kan hoger uitvallen")
  }

  if (mortgageAmount > targetHouseValue * 0.8) {
    advice.push("Hoge hypotheeklasten - overweeg kleinere woning")
  }

  if (purpose === 'renovate') {
    advice.push("Check of renovatiekosten fiscaal aftrekbaar zijn")
  }

  if (expectedReturn < 3) {
    advice.push("Laag rendement - overweeg andere spaarmethodes")
  }

  return {
    requiredDownPayment: Math.round(requiredDownPayment),
    totalRequiredCapital: Math.round(totalRequiredCapital),
    projectedSavings: Math.round(projectedSavings),
    shortfall: Math.round(shortfall),
    monthlyRequired: Math.round(monthlyRequired),
    timeToReachGoal: Math.round(timeToReachGoal * 10) / 10,
    inflationImpact,
    effectiveReturn: Math.round(effectiveReturn * 10) / 10,
    mortgageAmount: Math.round(mortgageAmount),
    monthlyMortgagePayment: Math.round(monthlyMortgagePayment),
    totalCost: Math.round(totalCost),
    advice
  }
}