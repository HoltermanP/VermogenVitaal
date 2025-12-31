export interface DeductionItem {
  id: string
  name: string
  description: string
  amount: number
  qualifies: boolean
  reason?: string
  category: string
}

export interface DeductionsCheckerInput {
  income: number
  hasMortgage: boolean
  mortgageInterest?: number
  isStudent: boolean
  studyCosts?: number
  donates: boolean
  donations?: number
  hasPension: boolean
  pensionPremiums?: number
  isEntrepreneur: boolean
  hoursWorked?: number
  isStarter?: boolean
  hasPartner: boolean
  bothWorking: boolean
}

export interface DeductionsCheckerResult {
  deductions: DeductionItem[]
  totalDeductions: number
  estimatedSavings: number
  qualifiesFor: number
  advice: string[]
}

export function checkDeductions(input: DeductionsCheckerInput): DeductionsCheckerResult {
  const deductions: DeductionItem[] = []

  // Hypotheekrenteaftrek
  if (input.hasMortgage && input.mortgageInterest && input.mortgageInterest > 0) {
    const qualifies = input.mortgageInterest <= 1000000 * 0.03 // Max €1M hypotheek
    deductions.push({
      id: 'mortgage',
      name: 'Hypotheekrenteaftrek',
      description: 'Aftrek van betaalde hypotheekrente',
      amount: input.mortgageInterest,
      qualifies,
      reason: qualifies ? undefined : 'Hypotheek te hoog of niet aftrekbaar',
      category: 'Woning'
    })
  }

  // Studiekosten
  if (input.isStudent && input.studyCosts && input.studyCosts > 0) {
    const qualifies = input.studyCosts <= 15000
    deductions.push({
      id: 'study',
      name: 'Studiekosten',
      description: 'Aftrek van studiekosten',
      amount: input.studyCosts,
      qualifies,
      reason: qualifies ? undefined : 'Te hoge studiekosten',
      category: 'Onderwijs'
    })
  }

  // Giften
  if (input.donates && input.donations && input.donations > 0) {
    const qualifies = input.donations >= 60 // Min €60
    deductions.push({
      id: 'donations',
      name: 'Giften',
      description: 'Aftrek van giften aan goede doelen',
      amount: input.donations,
      qualifies,
      reason: qualifies ? undefined : 'Minimum €60 vereist',
      category: 'Goede doelen'
    })
  }

  // Pensioenpremies
  if (input.hasPension && input.pensionPremiums && input.pensionPremiums > 0) {
    const qualifies = input.pensionPremiums <= 17000 // Max jaarruimte
    deductions.push({
      id: 'pension',
      name: 'Pensioenpremies',
      description: 'Aftrek van lijfrentepremies',
      amount: input.pensionPremiums,
      qualifies,
      reason: qualifies ? undefined : 'Boven maximum jaarruimte',
      category: 'Pensioen'
    })
  }

  // Zelfstandigenaftrek
  if (input.isEntrepreneur) {
    const requiredHours = 1225
    const qualifies = (input.hoursWorked || 0) >= requiredHours
    deductions.push({
      id: 'self-employed',
      name: 'Zelfstandigenaftrek',
      description: 'Aftrek voor ondernemers (€5.030)',
      amount: 5030,
      qualifies,
      reason: qualifies ? undefined : `Minimaal ${requiredHours} uur vereist`,
      category: 'Ondernemers'
    })
  }

  // Startersaftrek
  if (input.isEntrepreneur && input.isStarter) {
    const requiredHours = 1225
    const qualifies = (input.hoursWorked || 0) >= requiredHours
    deductions.push({
      id: 'starter',
      name: 'Startersaftrek',
      description: 'Extra aftrek voor starters (€2.123)',
      amount: 2123,
      qualifies,
      reason: qualifies ? undefined : `Minimaal ${requiredHours} uur vereist`,
      category: 'Ondernemers'
    })
  }

  // Inkomensafhankelijke combinatiekorting
  if (input.hasPartner && input.bothWorking) {
    deductions.push({
      id: 'combination',
      name: 'Inkomensafhankelijke combinatiekorting',
      description: 'Korting voor werkende partners',
      amount: 2888,
      qualifies: true,
      category: 'Kortingen'
    })
  }

  // Totaal
  const qualifyingDeductions = deductions.filter(d => d.qualifies)
  const totalDeductions = qualifyingDeductions.reduce((sum, d) => sum + d.amount, 0)
  const estimatedSavings = totalDeductions * 0.37 // Gemiddeld tarief
  const qualifiesFor = qualifyingDeductions.length

  // Advies
  const advice: string[] = []
  if (qualifiesFor > 0) {
    advice.push(`Je komt in aanmerking voor ${qualifiesFor} aftrekpost(en)`)
    advice.push(`Geschatte belastingbesparing: €${Math.round(estimatedSavings).toLocaleString('nl-NL')}`)
  } else {
    advice.push("Je komt momenteel niet in aanmerking voor aftrekposten")
  }

  const nonQualifying = deductions.filter(d => !d.qualifies)
  if (nonQualifying.length > 0) {
    advice.push(`${nonQualifying.length} aftrekpost(en) waar je niet voor kwalificeert`)
  }

  return {
    deductions,
    totalDeductions,
    estimatedSavings,
    qualifiesFor,
    advice
  }
}

