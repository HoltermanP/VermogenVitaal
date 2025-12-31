// Voorbeeld berekening om uit te leggen hoe het werkt

// Stel: €100.000 winst per jaar
const winst = 100000

// BV Scenario:
// 1. Vennootschapsbelasting: €100.000 * 19% = €19.000
// 2. Winst na VPB: €100.000 - €19.000 = €81.000
// 3. Dit bedrag blijft in BV en wordt belegd
// 4. Na 5 jaar: €81.000 * (1.07^5) = €115.000 (bij 7% rendement)
// 5. Box 3 belasting tijdens deze 5 jaar
// 6. Dividenduitkering: €115.000
// 7. Dividendbelasting: €115.000 * 26.5% = €30.475
// 8. Netto privé: €115.000 - €30.475 = €84.525

// EMZ Scenario:
// 1. Inkomstenbelasting: €100.000 * 37% = €37.000 (vereenvoudigd)
// 2. Netto privé: €100.000 - €37.000 = €63.000
// 3. Dit bedrag wordt belegd
// 4. Na 5 jaar: €63.000 * (1.07^5) = €89.000 (bij 7% rendement)
// 5. Box 3 belasting tijdens deze 5 jaar
// 6. Geld is al privé, geen dividendbelasting
// 7. Netto privé: €89.000

console.log("VOORBEELD BEREKENING")
console.log("====================")
console.log()

console.log("BV SCENARIO:")
console.log("1. Winst: €100.000")
console.log("2. Vennootschapsbelasting (19%): €19.000")
console.log("3. Winst na VPB: €81.000")
console.log("4. Belegd 5 jaar @ 7%: €81.000 → €115.000")
console.log("5. Box 3 belasting: ~€5.000 (over 5 jaar)")
console.log("6. Eindwaarde: €110.000")
console.log("7. Dividenduitkering: €110.000")
console.log("8. Dividendbelasting (26,5%): €29.150")
console.log("9. NETTO PRIVÉ: €80.850")
console.log()

console.log("EMZ SCENARIO:")
console.log("1. Winst: €100.000")
console.log("2. Inkomstenbelasting (~37%): €37.000")
console.log("3. Netto privé: €63.000")
console.log("4. Belegd 5 jaar @ 7%: €63.000 → €89.000")
console.log("5. Box 3 belasting: ~€3.500 (over 5 jaar)")
console.log("6. Eindwaarde: €85.500")
console.log("7. Geld is al privé - geen dividendbelasting")
console.log("8. NETTO PRIVÉ: €85.500")
console.log()

console.log("RESULTAAT:")
console.log("EMZ is €4.650 voordeliger over 5 jaar")
console.log("Dit komt doordat BV extra dividendbelasting betaalt bij uitkering")
