export interface SavingsChildrenInput {
  childAge: number
  goalAge: number // Leeftijd waarop geld nodig is (bijv. 18 voor studie)
  goalAmount: number
  currentSavings: number
  monthlyContribution: number
  expectedReturn: number
}

export interface SavingsChildrenResult {
  yearsToGoal: number
  totalContributed: number
  totalInterest: number
  finalAmount: number
  monthlyNeeded: number
  advice: string[]
}

export function calculateSavingsChildren(input: SavingsChildrenInput): SavingsChildrenResult {
  const {
    childAge,
    goalAge,
    goalAmount,
    currentSavings,
    monthlyContribution,
    expectedReturn = 0.04
  } = input

  const yearsToGoal = goalAge - childAge
  const monthsToGoal = yearsToGoal * 12
  const monthlyRate = expectedReturn / 12

  // Toekomstige waarde van huidige spaargeld
  const futureCurrentSavings = currentSavings * Math.pow(1 + monthlyRate, monthsToGoal)

  // Toekomstige waarde van maandelijkse inleg
  const futureContributions = monthlyContribution * (((Math.pow(1 + monthlyRate, monthsToGoal) - 1) / monthlyRate))

  const finalAmount = futureCurrentSavings + futureContributions
  const totalContributed = currentSavings + (monthlyContribution * monthsToGoal)
  const totalInterest = finalAmount - totalContributed

  // Benodigde maandelijkse inleg om doel te bereiken
  const neededFromContributions = goalAmount - futureCurrentSavings
  const monthlyNeeded = neededFromContributions / (((Math.pow(1 + monthlyRate, monthsToGoal) - 1) / monthlyRate))

  const advice: string[] = []
  if (finalAmount >= goalAmount) {
    advice.push(`Je bereikt je doel met de huidige inleg`)
  } else {
    advice.push(`Verhoog maandelijkse inleg naar €${Math.round(monthlyNeeded).toLocaleString('nl-NL')} om doel te bereiken`)
  }

  if (yearsToGoal > 10) {
    advice.push("Lange horizon: gebruik compound interest voordeel")
    advice.push("Overweeg beleggingen voor hoger rendement")
  } else if (yearsToGoal < 5) {
    advice.push("Korte horizon: focus op spaarrekening met gegarandeerd rendement")
  }

  if (goalAge === 18) {
    advice.push("Voor studiekosten: overweeg een spaarrekening op naam van het kind")
  }

  return {
    yearsToGoal,
    totalContributed,
    totalInterest,
    finalAmount,
    monthlyNeeded: Math.max(0, monthlyNeeded),
    advice
  }
}


