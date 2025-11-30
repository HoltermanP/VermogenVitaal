export interface MortgageInterestInput {
  mortgageAmount: number
  interestRate: number
  mortgageType: 'annuity' | 'linear' | 'other'
  mortgageYear: number
  hasPartner?: boolean
  income: number
}

export interface MortgageInterestResult {
  annualInterest: number
  deductibleInterest: number
  taxSavings: number
  netMonthlyPayment: number
  grossMonthlyPayment: number
  ownHomeForfait: number
  netBenefit: number
  effectiveRate: number
}

export function calculateMortgageInterest(input: MortgageInterestInput): MortgageInterestResult {
  const {
    mortgageAmount,
    interestRate,
    mortgageType,
    mortgageYear,
    hasPartner = false,
    income
  } = input

  // Jaarlijkse rente
  const annualInterest = mortgageAmount * (interestRate / 100)

  // Aftrekbaarheid (afhankelijk van type en jaar)
  let deductiblePercentage = 0
  if (mortgageYear >= 2013) {
    // Nieuwe regels vanaf 2013
    if (mortgageType === 'annuity' || mortgageType === 'linear') {
      deductiblePercentage = 0.3705 // 37.05% in 2025 (afbouw)
    } else {
      deductiblePercentage = 0 // Andere hypotheken niet aftrekbaar
    }
  } else {
    // Oude regels (volledig aftrekbaar)
    deductiblePercentage = 0.3705
  }

  const deductibleInterest = annualInterest * deductiblePercentage

  // Belastingbesparing (inkomstenbelasting)
  const incomeTaxRate = income > 75518 ? 0.495 : 0.3697
  const taxSavings = deductibleInterest * incomeTaxRate

  // Maandelijkse betalingen
  const monthlyInterest = annualInterest / 12
  const grossMonthlyPayment = monthlyInterest // Vereenvoudigd

  // Eigenwoningforfait (0.35% van WOZ, geschat op 80% van aankoopprijs)
  const estimatedWOZ = mortgageAmount / 0.8
  const ownHomeForfait = estimatedWOZ * 0.0035

  // Netto voordeel
  const netBenefit = taxSavings - (ownHomeForfait * incomeTaxRate)
  const netMonthlyPayment = grossMonthlyPayment - (taxSavings / 12)

  // Effectief tarief
  const effectiveRate = mortgageAmount > 0 ? ((annualInterest - taxSavings) / mortgageAmount) * 100 : interestRate

  return {
    annualInterest,
    deductibleInterest,
    taxSavings,
    netMonthlyPayment,
    grossMonthlyPayment,
    ownHomeForfait,
    netBenefit,
    effectiveRate
  }
}

