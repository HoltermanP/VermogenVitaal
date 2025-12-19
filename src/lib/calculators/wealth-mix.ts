export interface WealthMixInput {
  totalWealth: number
  currentSavings: number
  currentInvestments: number
  riskTolerance: 'low' | 'medium' | 'high'
  timeHorizon: number // Jaren
  goal: 'growth' | 'preservation' | 'income'
}

export interface WealthMixResult {
  recommendedSavings: number
  recommendedInvestments: number
  currentSavingsPercentage: number
  recommendedSavingsPercentage: number
  currentInvestmentsPercentage: number
  recommendedInvestmentsPercentage: number
  advice: string[]
}

export function calculateWealthMix(input: WealthMixInput): WealthMixResult {
  const {
    totalWealth,
    currentSavings,
    currentInvestments,
    riskTolerance,
    timeHorizon,
    goal
  } = input

  // Bepaal aanbevolen allocatie
  let recommendedSavingsPercentage = 0.5
  let recommendedInvestmentsPercentage = 0.5

  // Op basis van risicotolerantie
  if (riskTolerance === 'low') {
    recommendedSavingsPercentage = 0.7
    recommendedInvestmentsPercentage = 0.3
  } else if (riskTolerance === 'high') {
    recommendedSavingsPercentage = 0.3
    recommendedInvestmentsPercentage = 0.7
  }

  // Op basis van tijdshorizon
  if (timeHorizon < 5) {
    recommendedSavingsPercentage = Math.max(recommendedSavingsPercentage, 0.6)
    recommendedInvestmentsPercentage = Math.min(recommendedInvestmentsPercentage, 0.4)
  } else if (timeHorizon > 15) {
    recommendedSavingsPercentage = Math.min(recommendedSavingsPercentage, 0.4)
    recommendedInvestmentsPercentage = Math.max(recommendedInvestmentsPercentage, 0.6)
  }

  // Op basis van doel
  if (goal === 'preservation') {
    recommendedSavingsPercentage = 0.7
    recommendedInvestmentsPercentage = 0.3
  } else if (goal === 'growth') {
    recommendedSavingsPercentage = 0.3
    recommendedInvestmentsPercentage = 0.7
  } else if (goal === 'income') {
    recommendedSavingsPercentage = 0.4
    recommendedInvestmentsPercentage = 0.6
  }

  const recommendedSavings = totalWealth * recommendedSavingsPercentage
  const recommendedInvestments = totalWealth * recommendedInvestmentsPercentage

  const currentSavingsPercentage = (currentSavings / totalWealth) * 100
  const currentInvestmentsPercentage = (currentInvestments / totalWealth) * 100

  const advice: string[] = []
  const savingsDiff = recommendedSavings - currentSavings
  const investmentsDiff = recommendedInvestments - currentInvestments

  if (Math.abs(savingsDiff) > totalWealth * 0.1) {
    if (savingsDiff > 0) {
      advice.push(`Verhoog spaargeld met €${Math.round(savingsDiff).toLocaleString('nl-NL')}`)
    } else {
      advice.push(`Verlaag spaargeld met €${Math.round(Math.abs(savingsDiff)).toLocaleString('nl-NL')}`)
    }
  }

  if (Math.abs(investmentsDiff) > totalWealth * 0.1) {
    if (investmentsDiff > 0) {
      advice.push(`Verhoog beleggingen met €${Math.round(investmentsDiff).toLocaleString('nl-NL')}`)
    } else {
      advice.push(`Verlaag beleggingen met €${Math.round(Math.abs(investmentsDiff)).toLocaleString('nl-NL')}`)
    }
  }

  if (advice.length === 0) {
    advice.push("Je allocatie is goed gebalanceerd")
  }

  if (timeHorizon < 5 && recommendedInvestmentsPercentage > 0.5) {
    advice.push("Korte horizon: overweeg meer spaargeld voor zekerheid")
  }

  return {
    recommendedSavings,
    recommendedInvestments,
    currentSavingsPercentage,
    recommendedSavingsPercentage: recommendedSavingsPercentage * 100,
    currentInvestmentsPercentage,
    recommendedInvestmentsPercentage: recommendedInvestmentsPercentage * 100,
    advice
  }
}








