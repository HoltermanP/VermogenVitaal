import { getTaxRates, calculateLaborCredit, calculateCombinationCredit, type TaxYear } from "../tax-rates"

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
  year?: TaxYear
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
    bothWorking = false,
    year = 2025
  } = input

  const rates = getTaxRates(year).incomeTax

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

  // Inkomstenbelasting tarieven (jaar-specifiek)
  let bracket1 = 0
  let bracket2 = 0

  if (year === 2026) {
    // 2026 heeft 3 schijven
    const bracket2Limit = 79137
    if (taxableIncome <= rates.bracket1Limit) {
      bracket1 = taxableIncome * rates.bracket1Rate
    } else if (taxableIncome <= bracket2Limit) {
      bracket1 = rates.bracket1Limit * rates.bracket1Rate
      bracket2 = (taxableIncome - rates.bracket1Limit) * rates.bracket2Rate
    } else {
      bracket1 = rates.bracket1Limit * rates.bracket1Rate
      bracket2 = (bracket2Limit - rates.bracket1Limit) * rates.bracket2Rate
      // Schijf 3: 49.50%
      bracket2 += (taxableIncome - bracket2Limit) * 0.4950
    }
  } else {
    // 2025 heeft 2 schijven
    if (taxableIncome <= rates.bracket1Limit) {
      bracket1 = taxableIncome * rates.bracket1Rate
    } else {
      bracket1 = rates.bracket1Limit * rates.bracket1Rate
      bracket2 = (taxableIncome - rates.bracket1Limit) * rates.bracket2Rate
    }
  }

  const incomeTaxTotal = bracket1 + bracket2

  // Heffingskortingen (jaar-specifiek)
  const generalCredit = age < 65 ? rates.generalCredit.under65 : rates.generalCredit.over65
  const laborCredit = calculateLaborCredit(income, year)
  const combinationCredit = hasPartner && bothWorking ? calculateCombinationCredit(income, partnerIncome, year) : 0

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
  const marginalRate = year === 2026 && taxableIncome > 79137 
    ? 49.50 
    : taxableIncome > rates.bracket1Limit 
      ? rates.bracket2Rate * 100 
      : rates.bracket1Rate * 100

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


