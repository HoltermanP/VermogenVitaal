import { z } from "zod"

// BV vs EMZ Calculator
export const bvVsEmzSchema = z.object({
  revenue: z.number().min(0, "Omzet moet positief zijn"),
  costs: z.number().min(0, "Kosten moeten positief zijn"),
  dgaSalary: z.number().min(0, "DGA loon moet positief zijn"),
  employerCosts: z.number().min(0, "Werkgeverslasten moeten positief zijn"),
  dividend: z.number().min(0, "Dividend moet positief zijn"),
  mkbProfitExemption: z.boolean().default(true),
  selfEmployedDeduction: z.boolean().default(false),
  starterDeduction: z.boolean().default(false),
  pension: z.number().min(0).default(0),
  dgaPension: z.number().min(0).default(0),
})

export type BvVsEmzInput = z.infer<typeof bvVsEmzSchema>

// ETF Growth Calculator
export const etfGrowthSchema = z.object({
  initialInvestment: z.number().min(0, "Initiële inleg moet positief zijn"),
  monthlyContribution: z.number().min(0, "Maandelijkse inleg moet positief zijn"),
  expectedReturn: z.number().min(-100, "Rendement moet realistisch zijn").max(50, "Rendement moet realistisch zijn"),
  pessimisticReturn: z.number().min(-100).max(50),
  optimisticReturn: z.number().min(-100).max(50),
  ter: z.number().min(0).max(5, "TER moet realistisch zijn"),
  duration: z.number().min(1, "Looptijd moet minimaal 1 jaar zijn").max(50),
  rebalancing: z.boolean().default(true),
  box3Rate: z.number().min(0).max(10).default(1.97),
})

export type EtfGrowthInput = z.infer<typeof etfGrowthSchema>

// Real Estate Calculator
export const realEstateSchema = z.object({
  rent: z.number().min(0, "Huur moet positief zijn"),
  vacancyRate: z.number().min(0).max(100, "Leegstand moet tussen 0-100% zijn"),
  interestRate: z.number().min(0).max(20, "Rente moet realistisch zijn"),
  principal: z.number().min(0, "Aflossing moet positief zijn"),
  maintenanceRate: z.number().min(0).max(50, "Onderhoud moet realistisch zijn"),
  ozb: z.number().min(0, "OZB moet positief zijn"),
  insurance: z.number().min(0, "Verzekering moet positief zijn"),
  vve: z.number().min(0, "VvE moet positief zijn"),
  management: z.number().min(0, "Beheer moet positief zijn"),
  purchaseCosts: z.number().min(0, "Aankoopkosten moeten positief zijn"),
  ltv: z.number().min(0).max(100, "LTV moet tussen 0-100% zijn"),
  interestFixed: z.number().min(1).max(30, "Rentevast moet realistisch zijn"),
  country: z.enum(['NL', 'DE', 'FR', 'ES', 'IT', 'PT']),
  regime: z.enum(['box3', 'ib', 'vpb']),
})

export type RealEstateInput = z.infer<typeof realEstateSchema>

// Crypto Allocation Calculator
export const cryptoAllocationSchema = z.object({
  riskProfile: z.enum(['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE']),
  totalPortfolio: z.number().min(0, "Totale portefeuille moet positief zijn"),
  illiquidAssets: z.number().min(0, "Illiquide assets moeten positief zijn"),
  cryptoExperience: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  timeHorizon: z.number().min(1, "Beleggingshorizon moet minimaal 1 jaar zijn"),
})

export type CryptoAllocationInput = z.infer<typeof cryptoAllocationSchema>
