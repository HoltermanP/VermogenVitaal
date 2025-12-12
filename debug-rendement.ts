// Debug script om te zien waar de 83% vandaan komt

// Default waarden uit de calculator
const revenue = 150000
const costs = 25000
const profit = revenue - costs // 125.000

// BV berekening
const bvCorpTax = 19000 // 19% van 125.000 = 23.750, maar ik neem 19.000 aan voor debug
const bvInitialInvestment = profit - bvCorpTax // 125.000 - 23.750 = 101.250

// Na 5 jaar @ 7%: 101.250 * (1.07^5)
const endValueBV = 101250 * Math.pow(1.07, 5)
console.log("BV eindwaarde:", endValueBV)
console.log("BV totaal rendement:", ((endValueBV / 101250 - 1) * 100).toFixed(1) + "%")

// EMZ berekening
const emzTax = 125000 * 0.37 // Vereenvoudigd
const emzInitialInvestment = profit - emzTax // 125.000 - 46.250 = 78.750

// Na 5 jaar @ 7%: 78.750 * (1.07^5)
const endValueEMZ = 78750 * Math.pow(1.07, 5)
console.log("EMZ eindwaarde:", endValueEMZ)
console.log("EMZ totaal rendement:", ((endValueEMZ / 78750 - 1) * 100).toFixed(1) + "%")

// Maar als de gebruiker 83% ziet, misschien rekent hij het anders?
// Misschien ziet hij het jaarlijks rendement?
console.log("Jaarlijks rendement voor BV:", (Math.pow(endValueBV / 101250, 1/5) - 1) * 100)
console.log("Jaarlijks rendement voor EMZ:", (Math.pow(endValueEMZ / 78750, 1/5) - 1) * 100)
