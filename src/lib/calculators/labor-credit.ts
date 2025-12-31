export interface LaborCreditInput {
  income: number
  hasPartner?: boolean
  partnerIncome?: number
}

export interface LaborCreditResult {
  income: number
  laborCredit: number
  maxCredit: number
  phaseOutStart: number
  phaseOutEnd: number
  qualifies: boolean
  effectiveRate: number
  advice: string[]
}

export function calculateLaborCredit(input: LaborCreditInput): LaborCreditResult {
  const {
    income,
    hasPartner = false,
    partnerIncome = 0
  } = input

  // Arbeidskorting 2025
  const maxCredit = 5052
  const phaseOutStart = 75518
  const phaseOutEnd = 120000

  let laborCredit = 0
  let qualifies = false

  if (income <= 11403) {
    // Tot €11.403: 44.3% van inkomen
    laborCredit = income * 0.443
    qualifies = true
  } else if (income <= phaseOutStart) {
    // Van €11.403 tot €75.518: afbouw
    laborCredit = maxCredit - (income - 11403) * 0.0641
    qualifies = true
  } else if (income <= phaseOutEnd) {
    // Van €75.518 tot €120.000: verdere afbouw
    const baseCredit = maxCredit - (phaseOutStart - 11403) * 0.0641
    laborCredit = baseCredit - (income - phaseOutStart) * 0.1135
    qualifies = laborCredit > 0
  } else {
    // Boven €120.000: geen arbeidskorting
    laborCredit = 0
    qualifies = false
  }

  // Zorg dat credit niet negatief is
  laborCredit = Math.max(0, laborCredit)

  // Effectief tarief
  const effectiveRate = income > 0 ? (laborCredit / income) * 100 : 0

  // Advies
  const advice: string[] = []
  if (qualifies) {
    advice.push(`Arbeidskorting: €${Math.round(laborCredit).toLocaleString('nl-NL')}`)
    if (income < phaseOutStart) {
      advice.push("Je ontvangt het maximum arbeidskorting")
    } else if (income < phaseOutEnd) {
      const remaining = phaseOutEnd - income
      advice.push(`Arbeidskorting wordt afgebouwd, nog €${Math.round(remaining).toLocaleString('nl-NL')} tot einde`)
    }
  } else {
    if (income > phaseOutEnd) {
      advice.push("Je inkomen is te hoog voor arbeidskorting (boven €120.000)")
    }
  }

  if (hasPartner && partnerIncome > 0) {
    const partnerCredit = calculateLaborCredit({ income: partnerIncome }).laborCredit
    const totalCredit = laborCredit + partnerCredit
    advice.push(`Totaal arbeidskorting (beide partners): €${Math.round(totalCredit).toLocaleString('nl-NL')}`)
  }

  return {
    income,
    laborCredit: Math.round(laborCredit),
    maxCredit,
    phaseOutStart,
    phaseOutEnd,
    qualifies,
    effectiveRate,
    advice
  }
}

