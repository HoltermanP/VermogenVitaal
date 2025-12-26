export interface SavingsPlanInput {
  goalAmount: number
  currentSavings: number
  monthlyContribution: number
  interestRate: number
  years: number
}

export interface SavingsPlanResult {
  totalContributed: number
  totalInterest: number
  finalAmount: number
  monthsToGoal: number
  advice: string[]
}

export function calculateSavingsPlan(input: SavingsPlanInput): SavingsPlanResult {
  const {
    goalAmount,
    currentSavings,
    monthlyContribution,
    interestRate = 0.02,
    years
  } = input

  const monthlyRate = interestRate / 12
  const months = years * 12

  // Toekomstige waarde van huidige spaargeld
  const futureCurrentSavings = currentSavings * Math.pow(1 + monthlyRate, months)

  // Toekomstige waarde van maandelijkse inleg (annuïteit)
  const futureContributions = monthlyContribution * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate))

  const finalAmount = futureCurrentSavings + futureContributions
  const totalContributed = currentSavings + (monthlyContribution * months)
  const totalInterest = finalAmount - totalContributed

  // Bepaal wanneer doel bereikt wordt
  let monthsToGoal = months
  if (finalAmount >= goalAmount) {
    for (let m = 1; m <= months; m++) {
      const futureCurrent = currentSavings * Math.pow(1 + monthlyRate, m)
      const futureContrib = monthlyContribution * (((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate))
      if (futureCurrent + futureContrib >= goalAmount) {
        monthsToGoal = m
        break
      }
    }
  }

  const advice: string[] = []
  if (finalAmount >= goalAmount) {
    advice.push(`Je bereikt je doel in ${Math.round(monthsToGoal / 12)} jaar`)
  } else {
    const shortfall = goalAmount - finalAmount
    const extraMonthly = shortfall / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate))
    advice.push(`Verhoog maandelijkse inleg met €${Math.round(extraMonthly).toLocaleString('nl-NL')} om doel te bereiken`)
  }

  if (interestRate < 0.01) {
    advice.push("Overweeg een spaarrekening met hogere rente")
  }

  return {
    totalContributed,
    totalInterest,
    finalAmount,
    monthsToGoal,
    advice
  }
}
















