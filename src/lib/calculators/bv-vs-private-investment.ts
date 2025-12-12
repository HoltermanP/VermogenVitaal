export interface BvVsPrivateInvestmentInput {
  annualIncome: number // Jaarlijkse winst/inkomen
  expectedReturn: number // Jaarlijks rendement in %
  holdingPeriod: number // Aantal jaren
  hasPartner?: boolean
}

export interface BvVsPrivateInvestmentResult {
  private: {
    finalValue: number
    totalReturn: number
    box3TaxPaid: number
    netReturn: number
    effectiveTaxRate: number
  }
  bv: {
    finalValue: number
    totalReturn: number
    corpTaxPaid: number
    dividendTaxPaid: number
    totalTaxPaid: number
    netReturn: number
    effectiveTaxRate: number
  }
  comparison: {
    difference: number
    percentageDifference: number
    recommendation: 'private' | 'bv'
    breakEvenYears: number
  }
  advice: string[]
}

export function calculateBvVsPrivateInvestment(input: BvVsPrivateInvestmentInput): BvVsPrivateInvestmentResult {
  const {
    annualIncome,
    expectedReturn,
    holdingPeriod,
    hasPartner = false
  } = input

  const annualReturnRate = expectedReturn / 100

  // PRIVÉ SCENARIO (Eenmanszaak)
  // 1. Jaarlijks inkomen: €annualIncome
  // 2. Inkomstenbelasting: progressief tarief 2025 (36,97% tot €75.518, 49,5% daarboven)
  const calculateIncomeTax = (income: number) => {
    if (income <= 75518) {
      return income * 0.3697
    } else {
      return 75518 * 0.3697 + (income - 75518) * 0.495
    }
  }
  
  const privateIncomeTax = calculateIncomeTax(annualIncome)
  const privateNetIncome = annualIncome - privateIncomeTax

  // 3. Jaarlijkse accumulatie - Box 3 belasting wordt elk jaar berekend
  let privatePortfolioValue = 0
  let privateTotalInvested = 0
  let privateBox3TaxPaid = 0

  for (let year = 1; year <= holdingPeriod; year++) {
    // Box 3 belasting over het vermogen aan het BEGIN van het jaar (op 1 januari)
    // Dit wordt berekend over het vermogen VOOR de nieuwe investering
    const taxFreeAmount = hasPartner ? 114000 : 57000 // 2025 heffingsvrije voet
    const taxableAmount = Math.max(0, privatePortfolioValue - taxFreeAmount)

    if (taxableAmount > 0) {
      // Forfaitair rendement 6.17% voor 2025
      const assumedReturn = taxableAmount * 0.0617
      const yearBox3Tax = assumedReturn * 0.36 // 36% belasting
      privateBox3TaxPaid += yearBox3Tax
      privatePortfolioValue -= yearBox3Tax
    }

    // Nieuwe netto investering toevoegen na Box 3 belasting
    privatePortfolioValue += privateNetIncome
    privateTotalInvested += privateNetIncome

    // Groei van het portfolio over de rest van het jaar
    privatePortfolioValue *= (1 + annualReturnRate)
  }

  // Het totale rendement is de eindwaarde minus totaal geïnvesteerd
  const privateTotalReturn = privatePortfolioValue - privateTotalInvested
  const privateNetReturn = privateTotalReturn
  
  // Effectief belastingtarief = (inkomstenbelasting + Box 3 belasting) / totaal oorspronkelijk inkomen
  const privateTotalOriginalIncome = annualIncome * holdingPeriod
  const privateTotalIncomeTaxPaid = privateIncomeTax * holdingPeriod
  const privateTotalTaxPaid = privateTotalIncomeTaxPaid + privateBox3TaxPaid
  const privateEffectiveTaxRate = privateTotalOriginalIncome > 0 ? (privateTotalTaxPaid / privateTotalOriginalIncome) * 100 : 0

  // BV SCENARIO
  // 1. Jaarlijkse winst in BV: €annualIncome
  // 2. Vennootschapsbelasting: 19% tot €200k, 25.8% daarboven (2025)
  const calculateCorporateTax = (profit: number) => {
    if (profit <= 200000) {
      return profit * 0.19
    } else {
      return 200000 * 0.19 + (profit - 200000) * 0.258
    }
  }

  // 3. Geld blijft in BV en wordt belegd (GEEN jaarlijkse dividenduitkering)
  let bvPortfolioValue = 0
  let bvTotalInvested = 0
  let bvCorpTaxPaid = 0

  for (let year = 1; year <= holdingPeriod; year++) {
    // Jaarlijkse winst na vennootschapsbelasting
    const yearCorpTax = calculateCorporateTax(annualIncome)
    const yearNetIncome = annualIncome - yearCorpTax
    bvCorpTaxPaid += yearCorpTax

    // Voeg toe aan portfolio in BV
    bvPortfolioValue += yearNetIncome
    bvTotalInvested += yearNetIncome

    // Groei van het portfolio (geen Box 3 belasting, BV valt niet in Box 3)
    bvPortfolioValue *= (1 + annualReturnRate)
  }

  // 4. Na looptijd: dividenduitkering met 26.5% dividendbelasting
  const dividendTaxRate = 0.265
  const bvDividendPayout = bvPortfolioValue
  const bvDividendTaxPaid = bvDividendPayout * dividendTaxRate
  const bvFinalValue = bvDividendPayout - bvDividendTaxPaid

  const bvTotalReturn = bvFinalValue - bvTotalInvested
  const bvTotalTaxPaid = bvCorpTaxPaid + bvDividendTaxPaid
  const bvNetReturn = bvTotalReturn
  
  // Effectief belastingtarief = totale belasting / totaal oorspronkelijk inkomen
  const bvTotalOriginalIncome = annualIncome * holdingPeriod
  const bvEffectiveTaxRate = bvTotalOriginalIncome > 0 ? (bvTotalTaxPaid / bvTotalOriginalIncome) * 100 : 0

  // Vergelijking
  const difference = bvNetReturn - privateNetReturn
  const percentageDifference = privateNetReturn !== 0 ? (difference / Math.abs(privateNetReturn)) * 100 : 0
  const recommendation = difference > 0 ? 'bv' : 'private'

  // Break-even analyse
  let breakEvenYears = holdingPeriod // Default
  if (recommendation === 'bv') {
    breakEvenYears = 1 // Al voordeliger vanaf jaar 1
  } else {
    // Geschatte break-even (vereenvoudigd)
    breakEvenYears = Math.max(1, Math.ceil(holdingPeriod * 1.5))
  }

  // Advies genereren
  const advice: string[] = []

  if (recommendation === 'bv') {
    advice.push("Beleggen via BV lijkt voordeliger door lagere belasting op bedrijfsinkomen")
    advice.push("Houd rekening met extra administratieve lasten en oprichtingskosten van een BV")
  } else {
    advice.push("Privé beleggen lijkt voordeliger, mede door progressieve inkomstenbelasting")
    advice.push("Bij hogere inkomens wordt het BV-voordeel groter")
  }

  if (annualIncome > 100000) {
    advice.push("Bij hogere inkomens is een BV vaak fiscaal voordeliger")
  }

  if (holdingPeriod > 5) {
    advice.push("Bij langere termijn wordt het cumulatieve effect van belastingverschillen duidelijker")
  }

  return {
    private: {
      finalValue: Math.round(privatePortfolioValue),
      totalReturn: Math.round(privateTotalReturn),
      box3TaxPaid: Math.round(privateBox3TaxPaid),
      netReturn: Math.round(privateNetReturn),
      effectiveTaxRate: Math.round(privateEffectiveTaxRate * 100) / 100
    },
    bv: {
      finalValue: Math.round(bvFinalValue),
      totalReturn: Math.round(bvTotalReturn),
      corpTaxPaid: Math.round(bvCorpTaxPaid),
      dividendTaxPaid: Math.round(bvDividendTaxPaid),
      totalTaxPaid: Math.round(bvTotalTaxPaid),
      netReturn: Math.round(bvNetReturn),
      effectiveTaxRate: Math.round(bvEffectiveTaxRate * 100) / 100
    },
    comparison: {
      difference: Math.round(difference),
      percentageDifference: Math.round(percentageDifference * 100) / 100,
      recommendation,
      breakEvenYears
    },
    advice
  }
}

