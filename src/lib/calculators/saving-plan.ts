export interface SavingPlanInput {
  monthlyContribution: number
  targetAmount: number
  currentSavings: number
  timeHorizonYears: number
  expectedReturn: number
  riskLevel: 'conservative' | 'moderate' | 'aggressive'
  inflationRate: number
}

export interface SavingPlanResult {
  totalContributions: number
  totalInterest: number
  finalAmount: number
  timeToReachGoal: number
  monthlyRequired: number
  yearlyBreakdown: Array<{
    year: number
    contributions: number
    interest: number
    balance: number
  }>
  effectiveReturn: number
  inflationAdjustment: number
  advice: string[]
}

export function calculateSavingPlan(input: SavingPlanInput): SavingPlanResult {
  const {
    monthlyContribution,
    targetAmount,
    currentSavings = 0,
    timeHorizonYears,
    expectedReturn = 5,
    riskLevel = 'moderate',
    inflationRate = 2
  } = input

  // Aanpassen rendement gebaseerd op risiconiveau
  let adjustedReturn = expectedReturn
  if (riskLevel === 'conservative') {
    adjustedReturn = Math.max(expectedReturn * 0.7, 1)
  } else if (riskLevel === 'aggressive') {
    adjustedReturn = expectedReturn * 1.3
  }

  // Maandelijks rendement
  const monthlyReturn = adjustedReturn / 100 / 12

  let balance = currentSavings
  let totalContributions = currentSavings
  let totalInterest = 0
  const yearlyBreakdown = []

  // Simuleer jaar voor jaar
  for (let year = 0; year <= timeHorizonYears; year++) {
    if (year > 0) {
      // Jaarlijkse bijdragen
      const yearlyContribution = monthlyContribution * 12

      // Rente over het jaar
      const yearlyInterest = balance * (adjustedReturn / 100)

      balance += yearlyContribution + yearlyInterest
      totalContributions += yearlyContribution
      totalInterest += yearlyInterest
    }

    yearlyBreakdown.push({
      year,
      contributions: Math.round(totalContributions),
      interest: Math.round(totalInterest),
      balance: Math.round(balance)
    })

    // Stop als doel bereikt
    if (balance >= targetAmount) {
      break
    }
  }

  // Bereken tijd tot doel met huidige maandelijkse bijdrage
  let timeToReachGoal = timeHorizonYears
  if (balance >= targetAmount) {
    // Vind exact jaar waarin doel bereikt wordt
    const targetYear = yearlyBreakdown.findIndex(item => item.balance >= targetAmount)
    timeToReachGoal = targetYear > 0 ? targetYear : timeHorizonYears
  }

  // Bereken benodigd maandelijks bedrag om doel in gewenste tijd te bereiken
  const months = timeHorizonYears * 12
  const monthlyReturnRate = adjustedReturn / 100 / 12
  const targetWithoutCurrent = targetAmount - currentSavings

  // Formula voor maandelijkse bijdrage: PMT = PV * (r(1+r)^n) / ((1+r)^n - 1)
  const monthlyRequired = targetWithoutCurrent > 0 ?
    (targetWithoutCurrent * monthlyReturnRate * Math.pow(1 + monthlyReturnRate, months)) /
    (Math.pow(1 + monthlyReturnRate, months) - 1) : 0

  // Effectief rendement na inflatie
  const realReturn = (1 + adjustedReturn / 100) / (1 + inflationRate / 100) - 1
  const effectiveReturn = realReturn * 100

  // Inflatie impact
  const inflationMultiplier = Math.pow(1 + inflationRate / 100, timeHorizonYears)
  const inflationAdjustment = Math.round((inflationMultiplier - 1) * 100)

  // Advies genereren
  const advice: string[] = []

  if (monthlyContribution === 0 && monthlyRequired > 0) {
    advice.push(`Start met minimaal €${Math.round(monthlyRequired).toLocaleString('nl-NL')}/maand sparen`)
  }

  if (timeToReachGoal < timeHorizonYears) {
    advice.push(`Doel wordt bereikt in ${timeToReachGoal} jaar - sneller dan gepland!`)
  } else if (timeToReachGoal > timeHorizonYears) {
    advice.push(`Verhoog maandelijkse bijdrage voor realistischer tijdspad`)
  }

  if (effectiveReturn < 2) {
    advice.push("Effectief rendement na inflatie is laag - overweeg hogere risico's")
  }

  if (riskLevel === 'conservative' && expectedReturn > 4) {
    advice.push("Conservatief profiel past niet bij hoog verwacht rendement")
  }

  if (currentSavings > targetAmount * 0.5) {
    advice.push("Grote huidige buffer - focus op behoud in plaats van groei")
  }

  if (timeHorizonYears > 20) {
    advice.push("Lange termijn - compound interest werkt sterk in je voordeel")
  }

  return {
    totalContributions: Math.round(totalContributions),
    totalInterest: Math.round(totalInterest),
    finalAmount: Math.round(balance),
    timeToReachGoal: Math.round(timeToReachGoal * 10) / 10,
    monthlyRequired: Math.round(monthlyRequired),
    yearlyBreakdown,
    effectiveReturn: Math.round(effectiveReturn * 10) / 10,
    inflationAdjustment,
    advice
  }
}