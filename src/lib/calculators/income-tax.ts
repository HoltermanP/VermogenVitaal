export interface IncomeTaxInput {
  income: number
  partnerIncome?: number
  mortgageInterest?: number
  studyCosts?: number
  donations?: number
  pensionPremiums?: number
  age?: number
  hasPartner?: boolean
  bothWorking?: boolean
}

export interface IncomeTaxResult {
  grossIncome: number
  deductions: {
    mortgageInterest: number
    studyCosts: number
    donations: number
    pensionPremiums: number
    total: number
  }
  taxableIncome: number
  incomeTax: {
    bracket1: number
    bracket2: number
    total: number
  }
  taxCredits: {
    general: number
    labor: number
    combination?: number
    total: number
  }
  netIncome: number
  effectiveRate: number
  marginalRate: number
}

export function calculateIncomeTax(input: IncomeTaxInput): IncomeTaxResult {
  const {
    income,
    partnerIncome = 0,
    mortgageInterest = 0,
    studyCosts = 0,
    donations = 0,
    pensionPremiums = 0,
    age = 30,
    hasPartner = false,
    bothWorking = false
  } = input

  // Aftrekposten
  const deductions = {
    mortgageInterest: Math.min(mortgageInterest, 1000000 * 0.03), // Max hypotheek €1M
    studyCosts: Math.min(studyCosts, 15000),
    donations: donations >= 60 ? donations : 0, // Min €60
    pensionPremiums: Math.min(pensionPremiums, 17000), // Max jaarruimte
    total: 0
  }
  deductions.total = deductions.mortgageInterest + deductions.studyCosts + deductions.donations + deductions.pensionPremiums

  // Belastbaar inkomen
  const taxableIncome = Math.max(0, income - deductions.total)

  // Inkomstenbelasting tarieven 2025
  const bracket1Limit = 75518
  const bracket1Rate = 0.3697
  const bracket2Rate = 0.4950

  let bracket1 = 0
  let bracket2 = 0

  if (taxableIncome <= bracket1Limit) {
    bracket1 = taxableIncome * bracket1Rate
  } else {
    bracket1 = bracket1Limit * bracket1Rate
    bracket2 = (taxableIncome - bracket1Limit) * bracket2Rate
  }

  const incomeTaxTotal = bracket1 + bracket2

  // Heffingskortingen
  const generalCredit = age < 65 ? 3070 : 1535
  const laborCredit = calculateLaborCredit(income)
  const combinationCredit = hasPartner && bothWorking ? calculateCombinationCredit(income, partnerIncome) : 0

  const taxCredits = {
    general: generalCredit,
    labor: laborCredit,
    combination: combinationCredit,
    total: generalCredit + laborCredit + combinationCredit
  }

  // Netto belasting
  const netTax = Math.max(0, incomeTaxTotal - taxCredits.total)
  const netIncome = income - netTax

  // Effectief en marginaal tarief
  const effectiveRate = income > 0 ? (netTax / income) * 100 : 0
  const marginalRate = taxableIncome > bracket1Limit ? bracket2Rate * 100 : bracket1Rate * 100

  return {
    grossIncome: income,
    deductions,
    taxableIncome,
    incomeTax: {
      bracket1,
      bracket2,
      total: incomeTaxTotal
    },
    taxCredits,
    netIncome,
    effectiveRate,
    marginalRate
  }
}

function calculateLaborCredit(income: number): number {
  // Arbeidskorting 2025
  if (income <= 11403) {
    return income * 0.443
  } else if (income <= 75518) {
    return 5052 - (income - 11403) * 0.0641
  } else if (income <= 120000) {
    return 5052 - (75518 - 11403) * 0.0641 - (income - 75518) * 0.1135
  } else {
    return 0
  }
}

function calculateCombinationCredit(income: number, partnerIncome: number): number {
  const combinedIncome = income + partnerIncome
  if (combinedIncome <= 28888) {
    return combinedIncome * 0.1
  } else {
    return 2888 - (combinedIncome - 28888) * 0.065
  }
}

