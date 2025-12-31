import { getTaxRates, type TaxYear } from "../tax-rates"

export interface MortgageInterestInput {
  mortgageAmount: number
  interestRate: number
  mortgageType: 'annuity' | 'linear' | 'other'
  mortgageYear: number
  hasPartner?: boolean
  income: number
  year?: TaxYear
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
    income,
    year = 2025
  } = input
  // hasPartner is voor toekomstig gebruik maar wordt nu nog niet gebruikt

  const rates = getTaxRates(year)
  const mortgageRates = rates.mortgage
  const incomeTaxRates = rates.incomeTax

  // Jaarlijkse rente
  const annualInterest = mortgageAmount * (interestRate / 100)

  // Aftrekbaarheid (afhankelijk van type en jaar)
  let deductiblePercentage = 0
  if (mortgageYear >= 2013) {
    // Nieuwe regels vanaf 2013
    if (mortgageType === 'annuity' || mortgageType === 'linear') {
      deductiblePercentage = mortgageRates.deductiblePercentage
    } else {
      deductiblePercentage = 0 // Andere hypotheken niet aftrekbaar
    }
  } else {
    // Oude regels (volledig aftrekbaar)
    deductiblePercentage = mortgageRates.deductiblePercentage
  }

  const deductibleInterest = annualInterest * deductiblePercentage

  // Belastingbesparing (inkomstenbelasting - jaar-specifiek)
  const incomeTaxRate = income > incomeTaxRates.bracket1Limit 
    ? incomeTaxRates.bracket2Rate 
    : incomeTaxRates.bracket1Rate
  const taxSavings = deductibleInterest * incomeTaxRate

  // Maandelijkse betalingen
  const monthlyInterest = annualInterest / 12
  const grossMonthlyPayment = monthlyInterest // Vereenvoudigd

  // Eigenwoningforfait (jaar-specifiek)
  const estimatedWOZ = mortgageAmount / 0.8
  const ownHomeForfait = estimatedWOZ * mortgageRates.ownHomeForfaitRate

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

