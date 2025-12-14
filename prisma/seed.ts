import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create knowledge articles
  const knowledgeArticles = [
    {
      title: "Inkomstenbelasting voor ondernemers 2025",
      slug: "inkomstenbelasting-ondernemers-2025",
      tags: ["inkomstenbelasting", "ondernemers", "2025"],
      jurisdiction: "NL",
      effectiveFrom: new Date("2025-01-01"),
      effectiveTo: new Date("2025-12-31"),
      version: "1.0",
      body: `# Inkomstenbelasting voor ondernemers 2025

## Belangrijke wijzigingen

De inkomstenbelasting voor ondernemers is in 2025 aangepast met nieuwe tarieven en regels.

### Belastingschijven 2025

- **Schijf 1 (€0 - €75.518)**: 36,97%
- **Schijf 2 (€75.518+)**: 49,50%

### Zelfstandigenaftrek

De zelfstandigenaftrek bedraagt in 2025 €5.030. Dit is een forfaitaire aftrek voor ondernemers.

### Startersaftrek

Nieuwe ondernemers kunnen gebruik maken van de startersaftrek van €2.123 in 2025.

## Praktische tips

1. Houd je administratie goed bij
2. Maak gebruik van alle aftrekposten
3. Overweeg pensioenopbouw
4. Plan je uitbetalingen strategisch

## Disclaimer

Deze informatie is algemeen van aard. Raadpleeg altijd een belastingadviseur voor maatwerkbegeleiding.`
    },
    {
      title: "Vennootschapsbelasting en DGA salaris 2025",
      slug: "vennootschapsbelasting-dga-2025",
      tags: ["vennootschapsbelasting", "DGA", "BV", "2025"],
      jurisdiction: "NL",
      effectiveFrom: new Date("2025-01-01"),
      effectiveTo: new Date("2025-12-31"),
      version: "1.0",
      body: `# Vennootschapsbelasting en DGA salaris 2025

## Vennootschapsbelasting tarieven

De vennootschapsbelasting (VPB) kent in 2025 de volgende tarieven:

- **Tot €200.000**: 19%
- **Vanaf €200.000**: 25,8%

## MKB-winstvrijstelling

De MKB-winstvrijstelling bedraagt 14% van de winst tot €200.000. Dit betekent een effectief tarief van 14,44% voor de eerste €200.000.

## DGA salaris

Het DGA salaris moet marktconform zijn. De Belastingdienst hanteert richtlijnen voor het minimum DGA salaris.

### Minimum DGA salaris 2025

- **Bij winst tot €200.000**: €51.000
- **Bij winst vanaf €200.000**: €75.000

## Dividendbelasting

Dividenduitkeringen zijn belast tegen 26,5% dividendbelasting.

## Praktische overwegingen

1. Optimaliseer de verhouding tussen DGA salaris en dividend
2. Houd rekening met de MKB-winstvrijstelling
3. Overweeg pensioenopbouw via de BV
4. Plan je uitbetalingen strategisch

## Disclaimer

Deze informatie is algemeen van aard. Raadpleeg altijd een belastingadviseur voor maatwerkbegeleiding.`
    },
    {
      title: "Box 3 vermogensbelasting 2025",
      slug: "box3-vermogensbelasting-2025",
      tags: ["box3", "vermogensbelasting", "beleggen", "2025"],
      jurisdiction: "NL",
      effectiveFrom: new Date("2025-01-01"),
      effectiveTo: new Date("2025-12-31"),
      version: "1.0",
      body: `# Box 3 vermogensbelasting 2025

## Nieuwe Box 3 regeling 2025

Vanaf 2025 geldt een nieuwe box 3 regeling met forfaitaire rendementen:

- **Banktegoeden**: 0,36%
- **Beleggingen**: 6,17%
- **Schulden**: 2,57%

Over het totale forfaitaire rendement betaal je 36% belasting.

## Heffingsvrij vermogen

Het heffingsvrij vermogen bedraagt in 2025:
- **Alleenstaanden**: €57.000
- **Partners**: €114.000

## Vermogenscategorieën

### Banktegoeden
- Spaarrekeningen
- Cash
- Deposito's

### Beleggingen en overige bezittingen
- Aandelen
- Obligaties
- ETF's
- Vastgoed (indien niet in Box 1)
- Crypto (indien als belegging)
- Edelmetalen

### Schulden
- Leningen en hypotheken (indien niet gerelateerd aan eigen woning)

## Praktische tips

1. Optimaliseer je vermogensmix
2. Houd rekening met de nieuwe forfaitaire rendementen
3. Overweeg spreiding over categorieën
4. Plan je uitbetalingen strategisch

## Disclaimer

Deze informatie is algemeen van aard. Raadpleeg altijd een belastingadviseur voor maatwerkbegeleiding.`
    }
  ]

  for (const article of knowledgeArticles) {
    await prisma.knowledge.upsert({
      where: { slug: article.slug },
      update: article,
      create: article,
    })
  }

  console.log('✅ Knowledge articles created')

  // Create example scenarios (voor toekomstig gebruik)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const exampleScenarios = [
    {
      type: 'BV_VS_EMZ' as const,
      inputs: {
        revenue: 100000,
        costs: 20000,
        dgaSalary: 50000,
        employerCosts: 10000,
        dividend: 20000,
        mkbProfitExemption: true,
        selfEmployedDeduction: false,
        starterDeduction: false,
        pension: 5000,
        dgaPension: 10000
      },
      results: {
        emz: {
          netIncome: 65000,
          totalTax: 15000,
          effectiveRate: 18.75
        },
        bv: {
          netIncome: 68000,
          totalTax: 12000,
          effectiveRate: 15.0
        },
        comparison: {
          difference: 3000,
          percentageDifference: 4.6,
          recommendation: "BV"
        }
      }
    },
    {
      type: 'ETF_GROWTH' as const,
      inputs: {
        initialInvestment: 10000,
        monthlyContribution: 500,
        expectedReturn: 7,
        pessimisticReturn: 4,
        optimisticReturn: 10,
        ter: 0.2,
        duration: 20,
        rebalancing: true,
        box3Rate: 1.97
      },
      results: {
        finalValue: 250000,
        totalInvested: 130000,
        totalReturn: 120000,
        returnPercentage: 92.3,
        costImpact: 5000
      }
    }
  ]

  // Note: We can't create scenarios without a user, so we'll skip this for now
  console.log('✅ Example scenarios prepared')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
