export interface HomeDreamSavingsInput {
  goalAmount: number
  currentSavings: number
  monthlyContribution: number
  interestRate: number
  goalType: 'purchase' | 'renovation' | 'repayment'
}

export interface HomeDreamSavingsResult {
  totalContributed: number
  totalInterest: number
  finalAmount: number
  monthsToGoal: number
  yearsToGoal: number
  advice: string[]
}

export function calculateHomeDreamSavings(input: HomeDreamSavingsInput): HomeDreamSavingsResult {
  const {
    goalAmount,
    currentSavings,
    monthlyContribution,
    interestRate = 0.02,
    goalType
  } = input

  const monthlyRate = interestRate / 12

  // Bepaal wanneer doel bereikt wordt
  let monthsToGoal = 0
  let finalAmount = 0

  // Iteratief berekenen wanneer doel bereikt wordt
  for (let m = 1; m <= 600; m++) { // Max 50 jaar
    const futureCurrent = currentSavings * Math.pow(1 + monthlyRate, m)
    const futureContrib = monthlyContribution * (((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate))
    finalAmount = futureCurrent + futureContrib
    if (finalAmount >= goalAmount) {
      monthsToGoal = m
      break
    }
  }

  if (monthsToGoal === 0) {
    monthsToGoal = 600 // Max
    const futureCurrent = currentSavings * Math.pow(1 + monthlyRate, monthsToGoal)
    const futureContrib = monthlyContribution * (((Math.pow(1 + monthlyRate, monthsToGoal) - 1) / monthlyRate))
    finalAmount = futureCurrent + futureContrib
  }

  const yearsToGoal = monthsToGoal / 12
  const totalContributed = currentSavings + (monthlyContribution * monthsToGoal)
  const totalInterest = finalAmount - totalContributed

  const advice: string[] = []
  if (finalAmount >= goalAmount) {
    advice.push(`Je bereikt je doel in ${yearsToGoal.toFixed(1)} jaar`)
  } else {
    const shortfall = goalAmount - finalAmount
    const extraMonthly = shortfall / (((Math.pow(1 + monthlyRate, monthsToGoal) - 1) / monthlyRate))
    advice.push(`Verhoog maandelijkse inleg met €${Math.round(extraMonthly).toLocaleString('nl-NL')}`)
  }

  if (goalType === 'purchase') {
    advice.push("Voor koopsom: overweeg ook hypotheekmogelijkheden")
    advice.push("Houd rekening met extra kosten (kosten koper, notaris, etc.)")
  } else if (goalType === 'renovation') {
    advice.push("Voor verbouwing: vraag meerdere offertes op")
    advice.push("Overweeg energiebesparende maatregelen voor belastingvoordeel")
  } else if (goalType === 'repayment') {
    advice.push("Voor aflossing: check of boetevrij aflossen mogelijk is")
    advice.push("Aflossen kan belastingvoordeel hypotheekrenteaftrek verminderen")
  }

  return {
    totalContributed,
    totalInterest,
    finalAmount,
    monthsToGoal,
    yearsToGoal,
    advice
  }
}








