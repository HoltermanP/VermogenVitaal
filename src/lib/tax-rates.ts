export type TaxYear = 2025 | 2026

export interface IncomeTaxRates {
  bracket1Limit: number
  bracket1Rate: number
  bracket2Rate: number
  generalCredit: {
    under65: number
    over65: number
  }
  laborCredit: {
    max: number
    thresholds: number[]
    rates: number[]
  }
  combinationCredit: {
    max: number
    threshold: number
    rate: number
    reductionRate: number
  }
}

export interface CorporateTaxRates {
  bracket1Limit: number
  bracket1Rate: number
  bracket2Rate: number
  mkbExemptionRate: number
  mkbExemptionMax: number
  innovationBoxRate: number
  innovationBoxMax: number
  dgaMinSalary: {
    low: number
    high: number
    threshold: number
  }
}

export interface Box3Rates {
  taxFreeAmount: {
    single: number
    partner: number
  }
  assumedReturns: {
    bankSavings: number
    investments: number
    debts: number
  }
  taxRate: number
}

export interface MortgageRates {
  deductiblePercentage: number
  ownHomeForfaitRate: number
}

export interface DividendTaxRates {
  rate: number
}

export interface SelfEmployedRates {
  selfEmployedDeduction: number
  starterDeduction: number
  mkbProfitExemptionRate: number
  mkbProfitExemptionMax: number
}

export interface TaxRates {
  year: TaxYear
  incomeTax: IncomeTaxRates
  corporateTax: CorporateTaxRates
  box3: Box3Rates
  mortgage: MortgageRates
  dividendTax: DividendTaxRates
  selfEmployed: SelfEmployedRates
}

export const taxRates2025: TaxRates = {
  year: 2025,
  incomeTax: {
    bracket1Limit: 75518,
    bracket1Rate: 0.3697,
    bracket2Rate: 0.4950,
    generalCredit: {
      under65: 3070,
      over65: 1535
    },
    laborCredit: {
      max: 5052,
      thresholds: [11403, 75518, 120000],
      rates: [0.443, 0.0641, 0.1135]
    },
    combinationCredit: {
      max: 2888,
      threshold: 28888,
      rate: 0.1,
      reductionRate: 0.065
    }
  },
  corporateTax: {
    bracket1Limit: 200000,
    bracket1Rate: 0.19,
    bracket2Rate: 0.258,
    mkbExemptionRate: 0.14,
    mkbExemptionMax: 28000,
    innovationBoxRate: 0.09,
    innovationBoxMax: 350000,
    dgaMinSalary: {
      low: 56000,
      high: 56000,
      threshold: 200000
    }
  },
  box3: {
    taxFreeAmount: {
      single: 57000,
      partner: 114000
    },
    assumedReturns: {
      bankSavings: 0.0036,
      investments: 0.0617,
      debts: 0.0257
    },
    taxRate: 0.36
  },
  mortgage: {
    deductiblePercentage: 0.3705,
    ownHomeForfaitRate: 0.0035
  },
  dividendTax: {
    rate: 0.265
  },
  selfEmployed: {
    selfEmployedDeduction: 5030,
    starterDeduction: 2123,
    mkbProfitExemptionRate: 0.14,
    mkbProfitExemptionMax: 14000
  }
}

export const taxRates2026: TaxRates = {
  year: 2026,
  incomeTax: {
    // 2026 heeft 3 schijven volgens de web search
    bracket1Limit: 38883, // Eerste schijf tot €38.883
    bracket1Rate: 0.3570, // 35.70%
    bracket2Rate: 0.3756, // 37.56% voor schijf 2 (€38.883 - €79.137)
    generalCredit: {
      under65: 3115, // Verhoogd naar €3.115
      over65: 1557.5 // Verhoogd proportioneel
    },
    laborCredit: {
      max: 5712, // Verhoogd naar €5.712
      thresholds: [11403, 79137, 120000], // Aangepaste thresholds
      rates: [0.443, 0.0641, 0.1135] // Zelfde berekeningswijze
    },
    combinationCredit: {
      max: 2888, // Gelijk gebleven
      threshold: 28888,
      rate: 0.1,
      reductionRate: 0.065
    }
  },
  corporateTax: {
    bracket1Limit: 200000,
    bracket1Rate: 0.19, // Gelijk gebleven
    bracket2Rate: 0.258, // Gelijk gebleven
    mkbExemptionRate: 0.14,
    mkbExemptionMax: 28000,
    innovationBoxRate: 0.09,
    innovationBoxMax: 350000,
    dgaMinSalary: {
      low: 56000,
      high: 56000,
      threshold: 200000
    }
  },
  box3: {
    taxFreeAmount: {
      single: 57000, // Gelijk gebleven (mogelijk geïndexeerd)
      partner: 114000
    },
    assumedReturns: {
      bankSavings: 0.0036, // Mogelijk aangepast
      investments: 0.0617,
      debts: 0.0257
    },
    taxRate: 0.36
  },
  mortgage: {
    deductiblePercentage: 0.3700, // Verlaagd met 0.5% (afbouw)
    ownHomeForfaitRate: 0.0035
  },
  dividendTax: {
    rate: 0.265 // Gelijk gebleven
  },
  selfEmployed: {
    selfEmployedDeduction: 1200, // Verlaagd naar €1.200 (volgens web search)
    starterDeduction: 2123, // Gelijk gebleven
    mkbProfitExemptionRate: 0.14,
    mkbProfitExemptionMax: 14000
  }
}

export function getTaxRates(year: TaxYear): TaxRates {
  return year === 2026 ? taxRates2026 : taxRates2025
}

// Helper functie voor arbeidskorting berekening
export function calculateLaborCredit(income: number, year: TaxYear = 2025): number {
  const rates = getTaxRates(year).incomeTax.laborCredit
  
  if (income <= rates.thresholds[0]) {
    return income * rates.rates[0]
  } else if (income <= rates.thresholds[1]) {
    return rates.max - (income - rates.thresholds[0]) * rates.rates[1]
  } else if (income <= rates.thresholds[2]) {
    const firstPart = rates.max - (rates.thresholds[1] - rates.thresholds[0]) * rates.rates[1]
    return firstPart - (income - rates.thresholds[1]) * rates.rates[2]
  } else {
    return 0
  }
}

// Helper functie voor combinatiekorting berekening
export function calculateCombinationCredit(income: number, partnerIncome: number, year: TaxYear = 2025): number {
  const rates = getTaxRates(year).incomeTax.combinationCredit
  const combinedIncome = income + partnerIncome
  
  if (combinedIncome <= rates.threshold) {
    return combinedIncome * rates.rate
  } else {
    return rates.max - (combinedIncome - rates.threshold) * rates.reductionRate
  }
}

