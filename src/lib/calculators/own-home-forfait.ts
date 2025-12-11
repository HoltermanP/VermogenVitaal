export interface OwnHomeForfaitInput {
  wozValue: number
  mortgageAmount: number
  interestRate: number
  hasPartner?: boolean
  income: number
}

export interface OwnHomeForfaitResult {
  wozValue: number
  ownHomeForfait: number
  annualInterest: number
  deductibleInterest: number
  taxSavings: number
  netBenefit: number
  effectiveRate: number
  advice: string[]
}

export function calculateOwnHomeForfait(input: OwnHomeForfaitInput): OwnHomeForfaitResult {
  const {
    wozValue,
    mortgageAmount,
    interestRate,
    income
  } = input
  // hasPartner is voor toekomstig gebruik maar wordt nu nog niet gebruikt

  // Eigenwoningforfait 2025: 0.35% van WOZ-waarde
  const ownHomeForfaitRate = 0.0035
  const ownHomeForfait = wozValue * ownHomeForfaitRate
  const maxForfait = 1200 // Maximum eigenwoningforfait

  // Jaarlijkse hypotheekrente
  const annualInterest = mortgageAmount * (interestRate / 100)

  // Aftrekbare rente (37.05% in 2025)
  const deductibleRate = 0.3705
  const deductibleInterest = annualInterest * deductibleRate

  // Belastingbesparing
  const incomeTaxRate = income > 75518 ? 0.495 : 0.3697
  const taxSavings = deductibleInterest * incomeTaxRate

  // Eigenwoningforfait belasting
  const forfaitTax = Math.min(ownHomeForfait, maxForfait) * incomeTaxRate

  // Netto voordeel
  const netBenefit = taxSavings - forfaitTax

  // Effectief tarief
  const effectiveRate = mortgageAmount > 0 
    ? ((annualInterest - taxSavings + forfaitTax) / mortgageAmount) * 100 
    : interestRate

  // Advies
  const advice: string[] = []
  advice.push(`Eigenwoningforfait: €${Math.round(Math.min(ownHomeForfait, maxForfait)).toLocaleString('nl-NL')} (0.35% van WOZ)`)
  advice.push(`Aftrekbare rente: €${Math.round(deductibleInterest).toLocaleString('nl-NL')}`)
  advice.push(`Belastingbesparing: €${Math.round(taxSavings).toLocaleString('nl-NL')}`)
  advice.push(`Eigenwoningforfait belasting: €${Math.round(forfaitTax).toLocaleString('nl-NL')}`)
  
  if (netBenefit > 0) {
    advice.push(`Netto voordeel: €${Math.round(netBenefit).toLocaleString('nl-NL')}`)
  } else {
    advice.push("Eigenwoningforfait is hoger dan de belastingbesparing")
  }

  return {
    wozValue,
    ownHomeForfait: Math.min(ownHomeForfait, maxForfait),
    annualInterest,
    deductibleInterest,
    taxSavings,
    netBenefit,
    effectiveRate,
    advice
  }
}

