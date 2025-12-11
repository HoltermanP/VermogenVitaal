export interface WealthAllocationInput {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  timeHorizon: number
  currentAge: number
  annualIncome: number
  currentSavings: number
  monthlySavings: number
  goalAmount: number
  expectedMarketReturn: number
  inflationRate: number
}

export interface WealthAllocationResult {
  recommendedAllocation: {
    cash: number
    bonds: number
    stocks: number
    alternatives: number
  }
  expectedReturn: number
  expectedRisk: number
  projectedValue: number
  timeToGoal: number
  monthlyRequired: number
  shortfall: number
  riskAdjustedAllocation: string
  rebalancingFrequency: string
  alternatives: string[]
  advice: string[]
}

export function calculateWealthAllocation(input: WealthAllocationInput): WealthAllocationResult {
  const {
    riskTolerance,
    timeHorizon,
    currentAge,
    annualIncome,
    currentSavings = 0,
    monthlySavings = 0,
    goalAmount,
    expectedMarketReturn = 7,
    inflationRate = 2
  } = input

  // Basis allocatie gebaseerd op risicotolerantie
  let baseAllocation = { cash: 0, bonds: 0, stocks: 0, alternatives: 0 }

  if (riskTolerance === 'conservative') {
    baseAllocation = { cash: 40, bonds: 50, stocks: 10, alternatives: 0 }
  } else if (riskTolerance === 'moderate') {
    baseAllocation = { cash: 20, bonds: 40, stocks: 35, alternatives: 5 }
  } else { // aggressive
    baseAllocation = { cash: 10, bonds: 20, stocks: 60, alternatives: 10 }
  }

  // Leeftijd aanpassing (meer conservatief naarmate ouder)
  const ageAdjustment = Math.max(0, (currentAge - 30) * 0.5) // Max 35% aanpassing
  if (currentAge > 50) {
    baseAllocation.cash += Math.min(ageAdjustment, 20)
    baseAllocation.bonds += Math.min(ageAdjustment * 0.5, 15)
    baseAllocation.stocks -= Math.min(ageAdjustment * 1.5, 35)
  }

  // Tijd horizon aanpassing
  if (timeHorizon < 5) {
    // Kort termijn: meer cash en obligaties
    baseAllocation.cash += 20
    baseAllocation.stocks -= 20
  } else if (timeHorizon > 20) {
    // Lang termijn: meer stocks
    baseAllocation.stocks += 10
    baseAllocation.cash -= 5
    baseAllocation.bonds -= 5
  }

  // Verwacht rendement en risico
  const expectedReturn = (
    baseAllocation.cash * 2 + // Spaarrente ~2%
    baseAllocation.bonds * 4 + // Obligaties ~4%
    baseAllocation.stocks * expectedMarketReturn + // Aandelen ~7%
    baseAllocation.alternatives * (expectedMarketReturn + 2) // Alternatieven ~9%
  ) / 100

  const expectedRisk = (
    baseAllocation.cash * 0.5 + // Cash risico ~0.5%
    baseAllocation.bonds * 3 + // Obligaties ~3%
    baseAllocation.stocks * 15 + // Aandelen ~15%
    baseAllocation.alternatives * 20 // Alternatieven ~20%
  ) / 100

  // Projectie berekening
  const monthlyReturn = expectedReturn / 12
  let projectedValue = currentSavings

  // Toekomstwaarde huidige spaargelden
  projectedValue = currentSavings * Math.pow(1 + expectedReturn, timeHorizon)

  // Toekomstwaarde maandelijkse bijdragen
  if (monthlySavings > 0) {
    const months = timeHorizon * 12
    const futureValueMonthly = monthlySavings * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) * (1 + monthlyReturn)
    projectedValue += futureValueMonthly
  }

  // Doelanalyse
  const shortfall = Math.max(0, goalAmount - projectedValue)

  // Tijd tot doel
  let timeToGoal = timeHorizon
  if (projectedValue >= goalAmount && monthlySavings > 0) {
    let balance = currentSavings
    let monthsNeeded = 0

    while (balance < goalAmount && monthsNeeded < timeHorizon * 12) {
      balance += monthlySavings
      balance *= (1 + monthlyReturn)
      monthsNeeded++
    }

    timeToGoal = monthsNeeded / 12
  }

  // Maandelijks benodigd
  const months = timeHorizon * 12
  const targetWithoutCurrent = goalAmount - currentSavings
  const monthlyRequired = targetWithoutCurrent > 0 ?
    (targetWithoutCurrent * monthlyReturn * Math.pow(1 + monthlyReturn, months)) /
    (Math.pow(1 + monthlyReturn, months) - 1) : 0

  // Rebalancing frequentie
  let rebalancingFrequency = "Jaarlijks"
  if (expectedRisk > 0.15) {
    rebalancingFrequency = "Halfjaarlijks"
  }
  if (timeHorizon < 3) {
    rebalancingFrequency = "Maandelijks"
  }

  // Risk-adjusted beschrijving
  const riskAdjustedAllocation = riskTolerance === 'conservative' ?
    "Conservatieve portefeuille met focus op behoud kapitaal" :
    riskTolerance === 'moderate' ?
    "Gebalanceerde portefeuille met gematigd risico" :
    "Offensieve portefeuille gericht op groei"

  // Alternatieven
  const alternatives: string[] = []
  if (riskTolerance === 'conservative') {
    alternatives.push("Spaarrekening met hoge rente")
    alternatives.push("Staatsobligaties")
    alternatives.push("Depositogarantie tot €100.000")
  } else if (riskTolerance === 'moderate') {
    alternatives.push("Levensloopregeling")
    alternatives.push("Beleggingsfondsen")
    alternatives.push("ETFs wereldwijd gespreid")
  } else {
    alternatives.push("Direct aandelen")
    alternatives.push("Crypto (klein percentage)")
    alternatives.push("Private equity")
  }

  // Advies genereren
  const advice: string[] = []

  if (currentAge > 60 && riskTolerance === 'aggressive') {
    advice.push("Op latere leeftijd overwegen meer conservatieve allocatie")
  }

  if (timeHorizon < 5 && baseAllocation.stocks > 30) {
    advice.push("Kortetermijndoelen - verminder aandelen exposure")
  }

  if (expectedReturn < 4) {
    advice.push("Laag verwacht rendement - overweeg hoger risico voor betere groei")
  }

  if (shortfall > annualIncome) {
    advice.push("Groot verschil - heroverweeg doel of verleng tijdhorizon")
  }

  advice.push(`Verwacht rendement: ${expectedReturn.toFixed(1)}% per jaar`)
  advice.push(`Verwacht risico: ${expectedRisk.toFixed(1)}% per jaar`)

  if (monthlySavings === 0 && monthlyRequired > 0) {
    advice.push(`Start met minimaal €${Math.round(monthlyRequired).toLocaleString('nl-NL')}/maand`)
  }

  return {
    recommendedAllocation: {
      cash: Math.round(baseAllocation.cash),
      bonds: Math.round(baseAllocation.bonds),
      stocks: Math.round(baseAllocation.stocks),
      alternatives: Math.round(baseAllocation.alternatives)
    },
    expectedReturn: Math.round(expectedReturn * 1000) / 10,
    expectedRisk: Math.round(expectedRisk * 1000) / 10,
    projectedValue: Math.round(projectedValue),
    timeToGoal: Math.round(timeToGoal * 10) / 10,
    monthlyRequired: Math.round(monthlyRequired),
    shortfall: Math.round(shortfall),
    riskAdjustedAllocation,
    rebalancingFrequency,
    alternatives,
    advice
  }
}