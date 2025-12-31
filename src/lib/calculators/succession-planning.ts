export interface SuccessionPlanningInput {
  currentAge: number
  totalEstate: number
  beneficiaries: number
  desiredInheritance: number
  yearsToTransfer: number
  annualGiftAmount: number
  taxRate: number
}

export interface SuccessionPlanningResult {
  totalInheritanceTax: number
  totalGiftTax: number
  netInheritance: number
  netGift: number
  recommendedAnnualGift: number
  totalTaxSavings: number
  advice: string[]
}

export function calculateSuccessionPlanning(input: SuccessionPlanningInput): SuccessionPlanningResult {
  const {
    currentAge,
    totalEstate,
    beneficiaries,
    desiredInheritance,
    yearsToTransfer,
    annualGiftAmount = 0,
    taxRate = 0.2
  } = input

  // Erfbelasting tarieven 2025 (vereenvoudigd)
  const inheritanceTaxRates = [
    { threshold: 0, rate: 0.10 },
    { threshold: 138641, rate: 0.20 },
    { threshold: 138641, rate: 0.30 }
  ]

  // Totale erfbelasting bij overlijden
  let totalInheritanceTax = 0
  const inheritancePerBeneficiary = desiredInheritance / beneficiaries
  for (const rate of inheritanceTaxRates) {
    if (inheritancePerBeneficiary > rate.threshold) {
      const taxable = Math.min(inheritancePerBeneficiary - rate.threshold, inheritancePerBeneficiary)
      totalInheritanceTax += taxable * rate.rate * beneficiaries
    }
  }

  // Cadeau belasting (vereenvoudigd - jaarlijks €6,035 vrijstelling per kind)
  const annualGiftExemption = 6035 * beneficiaries
  const taxableGift = Math.max(0, annualGiftAmount - annualGiftExemption)
  const annualGiftTax = taxableGift * taxRate
  const totalGiftTax = annualGiftTax * yearsToTransfer

  // Totale giften over periode
  const totalGifts = annualGiftAmount * yearsToTransfer
  const netGift = totalGifts - totalGiftTax
  const netInheritance = desiredInheritance - totalInheritanceTax

  // Aanbevolen jaarlijks cadeau (maximale vrijstelling gebruiken)
  const recommendedAnnualGift = annualGiftExemption

  // Belastingbesparing door giften
  const remainingEstate = totalEstate - totalGifts
  const remainingInheritanceTax = remainingEstate * 0.2 // Vereenvoudigd
  const totalTaxSavings = totalInheritanceTax - remainingInheritanceTax - totalGiftTax

  const advice: string[] = []
  if (yearsToTransfer > 0) {
    advice.push(`Gebruik jaarlijkse vrijstelling van €${annualGiftExemption.toLocaleString('nl-NL')} per kind`)
  }

  if (totalTaxSavings > 0) {
    advice.push(`Je bespaart €${Math.round(totalTaxSavings).toLocaleString('nl-NL')} door giften`)
  }

  if (yearsToTransfer < 10 && totalEstate > 100000) {
    advice.push("Overweeg langere overdrachtsperiode voor meer belastingbesparing")
  }

  if (beneficiaries > 1) {
    advice.push(`Giften aan ${beneficiaries} begunstigden verhogen totale vrijstelling`)
  }

  return {
    totalInheritanceTax,
    totalGiftTax,
    netInheritance,
    netGift,
    recommendedAnnualGift,
    totalTaxSavings,
    advice
  }
}


















