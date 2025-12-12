// Test script for BV vs Private Investment Calculator
import { calculateBvVsPrivateInvestment } from '../src/lib/calculators/bv-vs-private-investment'

console.log('🧪 Testing BV vs Private Investment Calculator...')

console.log('🧪 Testing BV vs Private Investment Calculator...')

// Test case 1: Standard scenario
const test1 = calculateBvVsPrivateInvestment({
  annualIncome: 100000,
  expectedReturn: 7,
  holdingPeriod: 10,
  hasPartner: false
})

console.log('\n📊 Test 1: €100.000 jaarlijks inkomen, 7% rendement, 10 jaar')
console.log('Private scenario (Eenmanszaak):')
console.log(`  Eindwaarde portfolio: €${test1.private.finalValue.toLocaleString()}`)
console.log(`  Totaal belegd: €${(test1.private.finalValue - test1.private.totalReturn).toLocaleString()}`)
console.log(`  Beleggingsrendement: €${test1.private.totalReturn.toLocaleString()}`)
console.log(`  Box 3 belasting: €${test1.private.box3TaxPaid.toLocaleString()}`)
console.log(`  Netto rendement: €${test1.private.netReturn.toLocaleString()}`)

console.log('BV scenario:')
console.log(`  Eindwaarde portfolio: €${test1.bv.finalValue.toLocaleString()}`)
console.log(`  Totaal belegd: €${(test1.bv.finalValue - test1.bv.totalReturn).toLocaleString()}`)
console.log(`  Beleggingsrendement: €${test1.bv.totalReturn.toLocaleString()}`)
console.log(`  Vennootschapsbelasting: €${test1.bv.corpTaxPaid.toLocaleString()}`)
console.log(`  Dividendbelasting: €${test1.bv.dividendTaxPaid.toLocaleString()}`)
console.log(`  Netto rendement: €${test1.bv.netReturn.toLocaleString()}`)

console.log(`Aanbeveling: ${test1.comparison.recommendation === 'bv' ? 'BV' : 'Eenmanszaak'} beleggen`)
console.log(`Verschil: €${test1.comparison.difference.toLocaleString()}`)

// Test case 2: Higher income
const test2 = calculateBvVsPrivateInvestment({
  annualIncome: 200000,
  expectedReturn: 7,
  holdingPeriod: 10,
  hasPartner: false
})

console.log('\n📊 Test 2: €200.000 jaarlijks inkomen, 7% rendement, 10 jaar')
console.log(`BV netto rendement: €${test2.bv.netReturn.toLocaleString()}`)
console.log(`Eenmanszaak netto rendement: €${test2.private.netReturn.toLocaleString()}`)
console.log(`Aanbeveling: ${test2.comparison.recommendation === 'bv' ? 'BV' : 'Eenmanszaak'} beleggen`)
console.log(`Verschil: €${test2.comparison.difference.toLocaleString()}`)

// Test case 3: Lower income
const test3 = calculateBvVsPrivateInvestment({
  annualIncome: 50000,
  expectedReturn: 7,
  holdingPeriod: 10,
  hasPartner: false
})

console.log('\n📊 Test 3: €50.000 jaarlijks inkomen, 7% rendement, 10 jaar')
console.log(`BV netto rendement: €${test3.bv.netReturn.toLocaleString()}`)
console.log(`Eenmanszaak netto rendement: €${test3.private.netReturn.toLocaleString()}`)
console.log(`Aanbeveling: ${test3.comparison.recommendation === 'bv' ? 'BV' : 'Eenmanszaak'} beleggen`)
console.log(`Verschil: €${test3.comparison.difference.toLocaleString()}`)

// Test case 4: Very high income (should clearly favor BV)
const test4 = calculateBvVsPrivateInvestment({
  annualIncome: 500000,
  expectedReturn: 7,
  holdingPeriod: 10,
  hasPartner: false
})

console.log('\n📊 Test 4: €500.000 jaarlijks inkomen, 7% rendement, 10 jaar')
console.log(`BV netto rendement: €${test4.bv.netReturn.toLocaleString()}`)
console.log(`Eenmanszaak netto rendement: €${test4.private.netReturn.toLocaleString()}`)
console.log(`Aanbeveling: ${test4.comparison.recommendation === 'bv' ? 'BV' : 'Eenmanszaak'} beleggen`)
console.log(`Verschil: €${test4.comparison.difference.toLocaleString()}`)

// Test case: Simple 1-year scenario to verify calculation
console.log('\n🔍 Test: €100.000 jaarlijks inkomen, 1 jaar, 0% rendement')
const simpleTest = calculateBvVsPrivateInvestment({
  annualIncome: 100000,
  expectedReturn: 0,
  holdingPeriod: 1,
  hasPartner: false
})

console.log('Eenmanszaak:')
console.log(`  Eindwaarde: €${simpleTest.private.finalValue}`)
console.log(`  Totaal belegd: €${simpleTest.private.finalValue - simpleTest.private.totalReturn}`)
console.log(`  Box 3 belasting: €${simpleTest.private.box3TaxPaid}`)
console.log(`  Netto rendement: €${simpleTest.private.netReturn}`)

console.log('BV:')
console.log(`  Eindwaarde: €${simpleTest.bv.finalValue}`)
console.log(`  Totaal belegd: €${simpleTest.bv.finalValue - simpleTest.bv.totalReturn}`)
console.log(`  Belastingen: €${simpleTest.bv.totalTaxPaid}`)
console.log(`  Netto rendement: €${simpleTest.bv.netReturn}`)

console.log(`Verschil: €${simpleTest.comparison.difference}`)

console.log('\n✅ Tests voltooid!')
