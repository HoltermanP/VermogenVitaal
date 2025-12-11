export interface SuccessionPlanningInput {
  totalWealth: number
  heirs: Array<{
    name: string
    relationship: 'child' | 'partner' | 'parent' | 'sibling' | 'other'
    age: number
  }>
  desiredTiming: 'immediate' | 'retirement' | 'death'
  taxOptimization: boolean
  businessOwnership: boolean
  realEstate: boolean
}

export interface SuccessionPlanningResult {
  totalInheritance: number
  inheritanceTax: number
  netInheritance: number
  perHeir: Array<{
    name: string
    grossAmount: number
    taxAmount: number
    netAmount: number
  }>
  recommendedStrategy: string
  taxSavings: number
  timeline: string[]
  alternatives: string[]
  advice: string[]
}

export function calculateSuccessionPlanning(input: SuccessionPlanningInput): SuccessionPlanningResult {
  const {
    totalWealth,
    heirs,
    desiredTiming,
    taxOptimization = true,
    businessOwnership = false,
    realEstate = false
  } = input

  // Basis erfbelasting berekening (vereenvoudigd - 2025 tarieven)
  const calculateInheritanceTax = (amount: number, relationship: string): number => {
    if (relationship === 'partner') return 0 // Partner is vrijgesteld

    let taxFree = 0
    let taxRate = 0

    if (relationship === 'child') {
      taxFree = 24056 // Vrijstelling voor kinderen 2025
      taxRate = amount > taxFree ? 0.20 : 0 // 20% over bedrag boven vrijstelling
    } else if (relationship === 'parent' || relationship === 'sibling') {
      taxFree = 24056
      taxRate = amount > taxFree ? 0.30 : 0 // 30% voor ouders/broers/zussen
    } else {
      taxFree = 24056
      taxRate = amount > taxFree ? 0.40 : 0 // 40% voor anderen
    }

    const taxableAmount = Math.max(0, amount - taxFree)
    return taxableAmount * taxRate
  }

  // Gelijke verdeling onder erfgenamen
  const baseAmountPerHeir = heirs.length > 0 ? totalWealth / heirs.length : totalWealth

  // Berekening per erfgenaam
  const perHeir = heirs.map(heir => {
    const grossAmount = baseAmountPerHeir
    const taxAmount = calculateInheritanceTax(grossAmount, heir.relationship)
    const netAmount = grossAmount - taxAmount

    return {
      name: heir.name,
      grossAmount: Math.round(grossAmount),
      taxAmount: Math.round(taxAmount),
      netAmount: Math.round(netAmount)
    }
  })

  // Totaal
  const totalInheritanceTax = perHeir.reduce((sum, heir) => sum + heir.taxAmount, 0)
  const netInheritance = totalWealth - totalInheritanceTax

  // Belastingbesparingen door optimalisatie
  let taxSavings = 0
  let recommendedStrategy = "Gelijke verdeling onder erfgenamen"

  if (taxOptimization) {
    // Jaarlijkse schenking (max €6.035 per persoon per jaar)
    const annualGiftLimit = 6035
    const maxAnnualGifts = heirs.length * annualGiftLimit
    taxSavings = Math.min(totalInheritanceTax * 0.3, maxAnnualGifts * 10) // Vereenvoudigd

    if (businessOwnership) {
      recommendedStrategy = "Bedrijfsoverdracht met bedrijfsopvolgingsregeling"
      taxSavings += totalWealth * 0.05 // Extra besparing door BOR
    } else if (realEstate) {
      recommendedStrategy = "Fiscale partnerschap of stamrecht"
    } else {
      recommendedStrategy = "Jaarlijkse schenkingen en testament"
    }
  }

  // Timeline gebaseerd op gewenste timing
  const timeline: string[] = []
  if (desiredTiming === 'immediate') {
    timeline.push("Direct: Jaarlijkse schenkingen tot €6.035 per persoon")
    timeline.push("Direct: Oprichten fiscaal partnerschap")
  } else if (desiredTiming === 'retirement') {
    timeline.push("Bij pensionering: Grote schenking met vrijstelling")
    timeline.push("Bij pensionering: Bedrijfsoverdracht")
  } else { // death
    timeline.push("Bij overlijden: Testament met legaten")
    timeline.push("Bij overlijden: Uitvoering via executeur")
  }

  // Alternatieven
  const alternatives: string[] = []
  if (businessOwnership) {
    alternatives.push("Management buy-out")
    alternatives.push("Stichting administratiekantoor")
  }
  alternatives.push("Levensverzekering met erfgenamen als begunstigden")
  alternatives.push("Fiscale eenheid met partner")
  alternatives.push("Stamrecht voor partner met uitsluitingsclausule")

  // Advies genereren
  const advice: string[] = []

  if (totalInheritanceTax > totalWealth * 0.3) {
    advice.push("Hoge erfbelasting - overweeg optimalisatiestrategieën")
  }

  if (heirs.some(h => h.relationship === 'partner')) {
    advice.push("Partner is volledig vrijgesteld van erfbelasting")
  }

  if (businessOwnership) {
    advice.push("Bedrijfsopvolgingsregeling kan 83% van waarde vrijstellen")
  }

  if (realEstate) {
    advice.push("Onroerend goed heeft vaak lagere waardering voor erfbelasting")
  }

  if (taxOptimization && heirs.length > 2) {
    advice.push("Meer erfgenamen = hogere vrijstellingen mogelijk")
  }

  if (desiredTiming === 'immediate') {
    advice.push("Vroegtijdige planning voorkomt problemen later")
  }

  return {
    totalInheritance: Math.round(totalWealth),
    inheritanceTax: Math.round(totalInheritanceTax),
    netInheritance: Math.round(netInheritance),
    perHeir,
    recommendedStrategy,
    taxSavings: Math.round(taxSavings),
    timeline,
    alternatives,
    advice
  }
}