/**
 * Technische patroon detectie module
 * Detecteert verschillende chart patterns zoals reversal, continuation en bilateral patterns
 */

export type StockHistory = {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type PatternType = 
  // Reversal Patterns
  | 'double-top' | 'head-and-shoulders' | 'rising-wedge-reversal' | 'double-bottom' 
  | 'inverse-head-and-shoulders' | 'falling-wedge-reversal'
  // Continuation Patterns
  | 'falling-wedge-continuation' | 'bullish-rectangle' | 'bullish-pennant' 
  | 'rising-wedge-continuation' | 'bearish-rectangle' | 'bearish-pennant'
  // Bilateral Patterns
  | 'ascending-triangle' | 'descending-triangle' | 'symmetrical-triangle'

export type Pattern = {
  type: PatternType
  startIndex: number
  endIndex: number
  confidence: number // 0-1
  entry?: number
  stop?: number
  target?: number
  neckline?: number
  trendlines?: Array<{ start: { x: number, y: number }, end: { x: number, y: number } }>
  breakoutDirection?: 'bullish' | 'bearish' // Voor bilateral patterns
}

/**
 * Vind lokale minima en maxima in de data
 */
function findLocalExtrema(data: StockHistory[], lookback: number = 2): {
  peaks: Array<{ index: number, value: number }>
  troughs: Array<{ index: number, value: number }>
} {
  const peaks: Array<{ index: number, value: number }> = []
  const troughs: Array<{ index: number, value: number }> = []

  for (let i = lookback; i < data.length - lookback; i++) {
    const high = data[i].high
    const low = data[i].low
    const close = data[i].close

    // Check voor peak (high)
    let isPeak = true
    for (let j = i - lookback; j <= i + lookback; j++) {
      if (j !== i && data[j].high >= high) {
        isPeak = false
        break
      }
    }
    if (isPeak) {
      peaks.push({ index: i, value: high })
    }

    // Check voor trough (low)
    let isTrough = true
    for (let j = i - lookback; j <= i + lookback; j++) {
      if (j !== i && data[j].low <= low) {
        isTrough = false
        break
      }
    }
    if (isTrough) {
      troughs.push({ index: i, value: low })
    }
  }

  return { peaks, troughs }
}

/**
 * Detecteert Double Top patroon
 */
export function detectDoubleTop(data: StockHistory[]): Pattern[] {
  const patterns: Pattern[] = []
  const { peaks } = findLocalExtrema(data, 3)

  if (peaks.length < 2) return patterns

  // Zoek naar twee vergelijkbare pieken
  for (let i = 0; i < peaks.length - 1; i++) {
    for (let j = i + 1; j < peaks.length; j++) {
      const peak1 = peaks[i]
      const peak2 = peaks[j]
      const distance = peak2.index - peak1.index

      // Twee pieken moeten binnen redelijke afstand zijn (10-60 dagen)
      if (distance < 10 || distance > 60) continue

      // Pieken moeten vergelijkbaar zijn (binnen 3% van elkaar)
      const priceDiff = Math.abs(peak1.value - peak2.value) / Math.max(peak1.value, peak2.value)
      if (priceDiff > 0.03) continue

      // Vind het laagste punt tussen de twee pieken (neckline)
      let minLow = Infinity
      let minIndex = peak1.index
      for (let k = peak1.index; k <= peak2.index; k++) {
        if (data[k].low < minLow) {
          minLow = data[k].low
          minIndex = k
        }
      }

      // Bereken confidence op basis van hoe goed de pieken matchen
      const confidence = 1 - priceDiff * 10

      // Entry, stop en target
      const neckline = minLow
      const entry = neckline * 0.98 // Net onder neckline
      const stop = Math.max(peak1.value, peak2.value) * 1.02
      const target = neckline - (Math.max(peak1.value, peak2.value) - neckline)

      patterns.push({
        type: 'double-top',
        startIndex: peak1.index,
        endIndex: peak2.index,
        confidence: Math.max(0.5, confidence),
        entry,
        stop,
        target,
        neckline,
      })
    }
  }

  return patterns
}

/**
 * Detecteert Double Bottom patroon
 */
export function detectDoubleBottom(data: StockHistory[]): Pattern[] {
  const patterns: Pattern[] = []
  const { troughs } = findLocalExtrema(data, 3)

  if (troughs.length < 2) return patterns

  // Zoek naar twee vergelijkbare dieptepunten
  for (let i = 0; i < troughs.length - 1; i++) {
    for (let j = i + 1; j < troughs.length; j++) {
      const trough1 = troughs[i]
      const trough2 = troughs[j]
      const distance = trough2.index - trough1.index

      if (distance < 10 || distance > 60) continue

      const priceDiff = Math.abs(trough1.value - trough2.value) / Math.max(trough1.value, trough2.value)
      if (priceDiff > 0.03) continue

      // Vind het hoogste punt tussen de twee dieptepunten (neckline)
      let maxHigh = -Infinity
      let maxIndex = trough1.index
      for (let k = trough1.index; k <= trough2.index; k++) {
        if (data[k].high > maxHigh) {
          maxHigh = data[k].high
          maxIndex = k
        }
      }

      const confidence = 1 - priceDiff * 10
      const neckline = maxHigh
      const entry = neckline * 1.02 // Net boven neckline
      const stop = Math.min(trough1.value, trough2.value) * 0.98
      const target = neckline + (neckline - Math.min(trough1.value, trough2.value))

      patterns.push({
        type: 'double-bottom',
        startIndex: trough1.index,
        endIndex: trough2.index,
        confidence: Math.max(0.5, confidence),
        entry,
        stop,
        target,
        neckline,
      })
    }
  }

  return patterns
}

/**
 * Detecteert Head and Shoulders patroon
 */
export function detectHeadAndShoulders(data: StockHistory[]): Pattern[] {
  const patterns: Pattern[] = []
  const { peaks } = findLocalExtrema(data, 3)

  if (peaks.length < 3) return patterns

  // Zoek naar drie pieken waar de middelste het hoogst is
  for (let i = 0; i < peaks.length - 2; i++) {
    const leftShoulder = peaks[i]
    const head = peaks[i + 1]
    const rightShoulder = peaks[i + 2]

    // Head moet hoger zijn dan beide shoulders
    if (head.value <= leftShoulder.value || head.value <= rightShoulder.value) continue

    // Shoulders moeten vergelijkbaar zijn (binnen 5% van elkaar)
    const shoulderDiff = Math.abs(leftShoulder.value - rightShoulder.value) / 
                         Math.max(leftShoulder.value, rightShoulder.value)
    if (shoulderDiff > 0.05) continue

    // Vind neckline (laagste punt tussen left shoulder en head, en tussen head en right shoulder)
    let neckline1 = Infinity
    let neckline2 = Infinity
    for (let k = leftShoulder.index; k <= head.index; k++) {
      neckline1 = Math.min(neckline1, data[k].low)
    }
    for (let k = head.index; k <= rightShoulder.index; k++) {
      neckline2 = Math.min(neckline2, data[k].low)
    }
    const neckline = Math.min(neckline1, neckline2)

    const confidence = 0.7 - shoulderDiff * 5
    const entry = neckline * 0.98
    const stop = head.value * 1.02
    const target = neckline - (head.value - neckline)

    patterns.push({
      type: 'head-and-shoulders',
      startIndex: leftShoulder.index,
      endIndex: rightShoulder.index,
      confidence: Math.max(0.5, confidence),
      entry,
      stop,
      target,
      neckline,
    })
  }

  return patterns
}

/**
 * Detecteert Inverse Head and Shoulders patroon
 */
export function detectInverseHeadAndShoulders(data: StockHistory[]): Pattern[] {
  const patterns: Pattern[] = []
  const { troughs } = findLocalExtrema(data, 3)

  if (troughs.length < 3) return patterns

  for (let i = 0; i < troughs.length - 2; i++) {
    const leftShoulder = troughs[i]
    const head = troughs[i + 1]
    const rightShoulder = troughs[i + 2]

    if (head.value >= leftShoulder.value || head.value >= rightShoulder.value) continue

    const shoulderDiff = Math.abs(leftShoulder.value - rightShoulder.value) / 
                         Math.max(leftShoulder.value, rightShoulder.value)
    if (shoulderDiff > 0.05) continue

    let neckline1 = -Infinity
    let neckline2 = -Infinity
    for (let k = leftShoulder.index; k <= head.index; k++) {
      neckline1 = Math.max(neckline1, data[k].high)
    }
    for (let k = head.index; k <= rightShoulder.index; k++) {
      neckline2 = Math.max(neckline2, data[k].high)
    }
    const neckline = Math.max(neckline1, neckline2)

    const confidence = 0.7 - shoulderDiff * 5
    const entry = neckline * 1.02
    const stop = head.value * 0.98
    const target = neckline + (neckline - head.value)

    patterns.push({
      type: 'inverse-head-and-shoulders',
      startIndex: leftShoulder.index,
      endIndex: rightShoulder.index,
      confidence: Math.max(0.5, confidence),
      entry,
      stop,
      target,
      neckline,
    })
  }

  return patterns
}

/**
 * Detecteert Rising Wedge patroon (reversal)
 */
export function detectRisingWedgeReversal(data: StockHistory[]): Pattern[] {
  const patterns: Pattern[] = []
  const { peaks, troughs } = findLocalExtrema(data, 2)

  if (peaks.length < 3 || troughs.length < 3) return patterns

  // Zoek naar convergerende trendlijnen met stijgende trend
  for (let i = 0; i < peaks.length - 2; i++) {
    const peak1 = peaks[i]
    const peak2 = peaks[i + 1]
    const peak3 = peaks[i + 2]

    // Vind bijbehorende troughs
    const trough1 = troughs.find(t => t.index > peak1.index && t.index < peak2.index)
    const trough2 = troughs.find(t => t.index > peak2.index && t.index < peak3.index)

    if (!trough1 || !trough2) continue

    // Bovenste trendlijn moet stijgen maar minder steil dan onderste
    const upperSlope = (peak3.value - peak1.value) / (peak3.index - peak1.index)
    const lowerSlope = (trough2.value - trough1.value) / (trough2.index - trough1.index)

    if (upperSlope <= 0 || lowerSlope <= 0) continue
    if (lowerSlope <= upperSlope) continue // Onderste moet steiler zijn

    // Check of trendlijnen convergeren
    const convergence = (peak3.index - peak1.index) * (upperSlope - lowerSlope)
    if (convergence < 0) continue

    const confidence = 0.6
    const entry = trough2.value * 0.98
    const stop = peak3.value * 1.02
    const target = trough1.value - (peak1.value - trough1.value)

    patterns.push({
      type: 'rising-wedge-reversal',
      startIndex: peak1.index,
      endIndex: peak3.index,
      confidence,
      entry,
      stop,
      target,
      trendlines: [
        { start: { x: peak1.index, y: peak1.value }, end: { x: peak3.index, y: peak3.value } },
        { start: { x: trough1.index, y: trough1.value }, end: { x: trough2.index, y: trough2.value } },
      ],
    })
  }

  return patterns
}

/**
 * Detecteert Falling Wedge patroon (reversal)
 */
export function detectFallingWedgeReversal(data: StockHistory[]): Pattern[] {
  const patterns: Pattern[] = []
  const { peaks, troughs } = findLocalExtrema(data, 2)

  if (peaks.length < 3 || troughs.length < 3) return patterns

  for (let i = 0; i < troughs.length - 2; i++) {
    const trough1 = troughs[i]
    const trough2 = troughs[i + 1]
    const trough3 = troughs[i + 2]

    const peak1 = peaks.find(p => p.index > trough1.index && p.index < trough2.index)
    const peak2 = peaks.find(p => p.index > trough2.index && p.index < trough3.index)

    if (!peak1 || !peak2) continue

    const lowerSlope = (trough3.value - trough1.value) / (trough3.index - trough1.index)
    const upperSlope = (peak2.value - peak1.value) / (peak2.index - peak1.index)

    if (lowerSlope >= 0 || upperSlope >= 0) continue
    if (Math.abs(lowerSlope) <= Math.abs(upperSlope)) continue

    const confidence = 0.6
    const entry = peak2.value * 1.02
    const stop = trough3.value * 0.98
    const target = peak1.value + (peak1.value - trough1.value)

    patterns.push({
      type: 'falling-wedge-reversal',
      startIndex: trough1.index,
      endIndex: trough3.index,
      confidence,
      entry,
      stop,
      target,
      trendlines: [
        { start: { x: peak1.index, y: peak1.value }, end: { x: peak2.index, y: peak2.value } },
        { start: { x: trough1.index, y: trough1.value }, end: { x: trough3.index, y: trough3.value } },
      ],
    })
  }

  return patterns
}

/**
 * Detecteert Rectangle patterns (continuation)
 */
export function detectRectangles(data: StockHistory[]): Pattern[] {
  const patterns: Pattern[] = []
  const { peaks, troughs } = findLocalExtrema(data, 2)

  if (peaks.length < 2 || troughs.length < 2) return patterns

  // Bullish Rectangle: horizontale consolidatie na uptrend
  for (let i = 0; i < peaks.length - 1; i++) {
    const peak1 = peaks[i]
    const peak2 = peaks[i + 1]
    const trough1 = troughs.find(t => t.index > peak1.index && t.index < peak2.index)
    const trough2 = troughs.find(t => t.index > peak2.index)

    if (!trough1 || !trough2) continue

    // Check of peaks en troughs horizontaal zijn
    const peakDiff = Math.abs(peak1.value - peak2.value) / Math.max(peak1.value, peak2.value)
    const troughDiff = Math.abs(trough1.value - trough2.value) / Math.max(trough1.value, trough2.value)

    if (peakDiff < 0.02 && troughDiff < 0.02) {
      const confidence = 0.65
      const resistance = (peak1.value + peak2.value) / 2
      const support = (trough1.value + trough2.value) / 2
      const entry = resistance * 1.01
      const stop = support * 0.99
      const target = resistance + (resistance - support)

      patterns.push({
        type: 'bullish-rectangle',
        startIndex: peak1.index,
        endIndex: peak2.index,
        confidence,
        entry,
        stop,
        target,
      })
    }
  }

  // Bearish Rectangle: horizontale consolidatie na downtrend
  for (let i = 0; i < troughs.length - 1; i++) {
    const trough1 = troughs[i]
    const trough2 = troughs[i + 1]
    const peak1 = peaks.find(p => p.index > trough1.index && p.index < trough2.index)
    const peak2 = peaks.find(p => p.index > trough2.index)

    if (!peak1 || !peak2) continue

    const peakDiff = Math.abs(peak1.value - peak2.value) / Math.max(peak1.value, peak2.value)
    const troughDiff = Math.abs(trough1.value - trough2.value) / Math.max(trough1.value, trough2.value)

    if (peakDiff < 0.02 && troughDiff < 0.02) {
      const confidence = 0.65
      const resistance = (peak1.value + peak2.value) / 2
      const support = (trough1.value + trough2.value) / 2
      const entry = support * 0.99
      const stop = resistance * 1.01
      const target = support - (resistance - support)

      patterns.push({
        type: 'bearish-rectangle',
        startIndex: trough1.index,
        endIndex: trough2.index,
        confidence,
        entry,
        stop,
        target,
      })
    }
  }

  return patterns
}

/**
 * Detecteert Triangle patterns (bilateral)
 */
export function detectTriangles(data: StockHistory[]): Pattern[] {
  const patterns: Pattern[] = []
  const { peaks, troughs } = findLocalExtrema(data, 2)

  if (peaks.length < 3 || troughs.length < 3) return patterns

  // Ascending Triangle: horizontale resistance, stijgende support
  for (let i = 0; i < peaks.length - 2; i++) {
    const peak1 = peaks[i]
    const peak2 = peaks[i + 1]
    const peak3 = peaks[i + 2]

    const peakDiff1 = Math.abs(peak1.value - peak2.value) / Math.max(peak1.value, peak2.value)
    const peakDiff2 = Math.abs(peak2.value - peak3.value) / Math.max(peak2.value, peak3.value)

    if (peakDiff1 < 0.02 && peakDiff2 < 0.02) {
      // Horizontale resistance gevonden, zoek stijgende support
      const trough1 = troughs.find(t => t.index > peak1.index && t.index < peak2.index)
      const trough2 = troughs.find(t => t.index > peak2.index && t.index < peak3.index)

      if (trough1 && trough2 && trough2.value > trough1.value) {
        const confidence = 0.7
        const resistance = (peak1.value + peak2.value + peak3.value) / 3
        const support = (trough1.value + trough2.value) / 2
        const height = resistance - support

        patterns.push({
          type: 'ascending-triangle',
          startIndex: peak1.index,
          endIndex: peak3.index,
          confidence,
          entry: resistance * 1.01, // Bullish breakout
          stop: support * 0.99,
          target: resistance + height,
          trendlines: [
            { start: { x: peak1.index, y: resistance }, end: { x: peak3.index, y: resistance } },
            { start: { x: trough1.index, y: trough1.value }, end: { x: trough2.index, y: trough2.value } },
          ],
          breakoutDirection: 'bullish',
        })
      }
    }
  }

  // Descending Triangle: dalende resistance, horizontale support
  for (let i = 0; i < troughs.length - 2; i++) {
    const trough1 = troughs[i]
    const trough2 = troughs[i + 1]
    const trough3 = troughs[i + 2]

    const troughDiff1 = Math.abs(trough1.value - trough2.value) / Math.max(trough1.value, trough2.value)
    const troughDiff2 = Math.abs(trough2.value - trough3.value) / Math.max(trough2.value, trough3.value)

    if (troughDiff1 < 0.02 && troughDiff2 < 0.02) {
      const peak1 = peaks.find(p => p.index > trough1.index && p.index < trough2.index)
      const peak2 = peaks.find(p => p.index > trough2.index && p.index < trough3.index)

      if (peak1 && peak2 && peak2.value < peak1.value) {
        const confidence = 0.7
        const support = (trough1.value + trough2.value + trough3.value) / 3
        const resistance = (peak1.value + peak2.value) / 2
        const height = resistance - support

        patterns.push({
          type: 'descending-triangle',
          startIndex: trough1.index,
          endIndex: trough3.index,
          confidence,
          entry: support * 0.99, // Bearish breakout
          stop: resistance * 1.01,
          target: support - height,
          trendlines: [
            { start: { x: peak1.index, y: peak1.value }, end: { x: peak2.index, y: peak2.value } },
            { start: { x: trough1.index, y: support }, end: { x: trough3.index, y: support } },
          ],
          breakoutDirection: 'bearish',
        })
      }
    }
  }

  // Symmetrical Triangle: convergerende trendlijnen
  for (let i = 0; i < Math.min(peaks.length, troughs.length) - 2; i++) {
    if (i + 2 >= peaks.length || i + 2 >= troughs.length) continue

    const peak1 = peaks[i]
    const peak2 = peaks[i + 1]
    const peak3 = peaks[i + 2]
    const trough1 = troughs[i]
    const trough2 = troughs[i + 1]
    const trough3 = troughs[i + 2]

    const upperSlope = (peak3.value - peak1.value) / (peak3.index - peak1.index)
    const lowerSlope = (trough3.value - trough1.value) / (trough3.index - trough1.index)

    // Trendlijnen moeten convergeren (tegengestelde richting)
    if (upperSlope > 0 && lowerSlope > 0) continue
    if (upperSlope < 0 && lowerSlope < 0) continue

    const confidence = 0.65
    const height = (peak1.value + peak2.value + peak3.value) / 3 - (trough1.value + trough2.value + trough3.value) / 3

    patterns.push({
      type: 'symmetrical-triangle',
      startIndex: Math.min(peak1.index, trough1.index),
      endIndex: Math.max(peak3.index, trough3.index),
      confidence,
      entry: peak3.value * 1.01, // Bullish scenario
      stop: trough3.value * 0.99,
      target: peak3.value + height,
      trendlines: [
        { start: { x: peak1.index, y: peak1.value }, end: { x: peak3.index, y: peak3.value } },
        { start: { x: trough1.index, y: trough1.value }, end: { x: trough3.index, y: trough3.value } },
      ],
      breakoutDirection: 'bullish',
    })
  }

  return patterns
}

/**
 * Detecteert alle patronen in de data
 */
export function detectAllPatterns(data: StockHistory[], enabledPatterns: PatternType[] = []): Pattern[] {
  if (data.length < 20) return []

  const allPatterns: Pattern[] = []

  // Reversal patterns
  if (enabledPatterns.length === 0 || enabledPatterns.includes('double-top')) {
    allPatterns.push(...detectDoubleTop(data))
  }
  if (enabledPatterns.length === 0 || enabledPatterns.includes('double-bottom')) {
    allPatterns.push(...detectDoubleBottom(data))
  }
  if (enabledPatterns.length === 0 || enabledPatterns.includes('head-and-shoulders')) {
    allPatterns.push(...detectHeadAndShoulders(data))
  }
  if (enabledPatterns.length === 0 || enabledPatterns.includes('inverse-head-and-shoulders')) {
    allPatterns.push(...detectInverseHeadAndShoulders(data))
  }
  if (enabledPatterns.length === 0 || enabledPatterns.includes('rising-wedge-reversal')) {
    allPatterns.push(...detectRisingWedgeReversal(data))
  }
  if (enabledPatterns.length === 0 || enabledPatterns.includes('falling-wedge-reversal')) {
    allPatterns.push(...detectFallingWedgeReversal(data))
  }

  // Continuation patterns
  if (enabledPatterns.length === 0 || enabledPatterns.includes('bullish-rectangle')) {
    allPatterns.push(...detectRectangles(data).filter(p => p.type === 'bullish-rectangle'))
  }
  if (enabledPatterns.length === 0 || enabledPatterns.includes('bearish-rectangle')) {
    allPatterns.push(...detectRectangles(data).filter(p => p.type === 'bearish-rectangle'))
  }

  // Bilateral patterns
  if (enabledPatterns.length === 0 || enabledPatterns.includes('ascending-triangle') || 
      enabledPatterns.includes('descending-triangle') || enabledPatterns.includes('symmetrical-triangle')) {
    const triangles = detectTriangles(data)
    if (enabledPatterns.length === 0) {
      allPatterns.push(...triangles)
    } else {
      allPatterns.push(...triangles.filter(p => enabledPatterns.includes(p.type)))
    }
  }

  // Filter op confidence en sorteer
  return allPatterns
    .filter(p => p.confidence >= 0.5)
    .sort((a, b) => b.confidence - a.confidence)
}

/**
 * Krijg patroon naam in Nederlands
 */
export function getPatternName(type: PatternType): string {
  const names: Record<PatternType, string> = {
    'double-top': 'Double Top',
    'head-and-shoulders': 'Head and Shoulders',
    'rising-wedge-reversal': 'Rising Wedge (Reversal)',
    'double-bottom': 'Double Bottom',
    'inverse-head-and-shoulders': 'Inverse Head and Shoulders',
    'falling-wedge-reversal': 'Falling Wedge (Reversal)',
    'falling-wedge-continuation': 'Falling Wedge (Continuation)',
    'bullish-rectangle': 'Bullish Rectangle',
    'bullish-pennant': 'Bullish Pennant',
    'rising-wedge-continuation': 'Rising Wedge (Continuation)',
    'bearish-rectangle': 'Bearish Rectangle',
    'bearish-pennant': 'Bearish Pennant',
    'ascending-triangle': 'Ascending Triangle',
    'descending-triangle': 'Descending Triangle',
    'symmetrical-triangle': 'Symmetrical Triangle',
  }
  return names[type] || type
}

/**
 * Krijg patroon verklaring in Nederlands
 */
export function getPatternExplanation(type: PatternType): string {
  const explanations: Record<PatternType, string> = {
    'double-top': 'Twee vergelijkbare pieken vormen een weerstandsniveau. Dit wijst op een mogelijke omkering naar beneden wanneer de prijs onder de neckline breekt.',
    'head-and-shoulders': 'Drie pieken waarbij de middelste het hoogst is. Dit bearish patroon suggereert een trendomkering wanneer de prijs onder de neckline daalt.',
    'rising-wedge-reversal': 'Convergerende trendlijnen met stijgende trend, maar met afnemend momentum. Dit kan een bearish omkering voorspellen.',
    'double-bottom': 'Twee vergelijkbare dieptepunten vormen een steunniveau. Dit wijst op een mogelijke omkering naar boven wanneer de prijs boven de neckline breekt.',
    'inverse-head-and-shoulders': 'Drie dieptepunten waarbij de middelste het laagst is. Dit bullish patroon suggereert een trendomkering wanneer de prijs boven de neckline stijgt.',
    'falling-wedge-reversal': 'Convergerende trendlijnen met dalende trend, maar met afnemend momentum. Dit kan een bullish omkering voorspellen.',
    'falling-wedge-continuation': 'Convergerende trendlijnen in een dalende trend die een consolidatieperiode aangeven, vaak gevolgd door voortzetting van de downtrend.',
    'bullish-rectangle': 'Horizontale consolidatie na een uptrend. Dit patroon suggereert een voortzetting van de stijgende trend na een breakout boven de resistance.',
    'bullish-pennant': 'Kleine driehoekige consolidatie na een sterke stijging, meestal gevolgd door voortzetting van de uptrend.',
    'rising-wedge-continuation': 'Convergerende trendlijnen in een stijgende trend die een consolidatieperiode aangeven, vaak gevolgd door voortzetting van de uptrend.',
    'bearish-rectangle': 'Horizontale consolidatie na een downtrend. Dit patroon suggereert een voortzetting van de dalende trend na een breakout onder de support.',
    'bearish-pennant': 'Kleine driehoekige consolidatie na een sterke daling, meestal gevolgd door voortzetting van de downtrend.',
    'ascending-triangle': 'Horizontale resistance met stijgende support. Dit bullish patroon suggereert een breakout naar boven wanneer de prijs de resistance doorbreekt.',
    'descending-triangle': 'Dalende resistance met horizontale support. Dit bearish patroon suggereert een breakout naar beneden wanneer de prijs de support doorbreekt.',
    'symmetrical-triangle': 'Convergerende trendlijnen die een consolidatieperiode aangeven. De richting van de breakout bepaalt de trendrichting.',
  }
  return explanations[type] || 'Geen verklaring beschikbaar.'
}

/**
 * Krijg de voorspelde trend voor een patroon
 */
export function getPatternTrend(pattern: Pattern): 'bullish' | 'bearish' | 'neutraal' {
  // Bepaal trend op basis van patroon type en breakout direction
  if (pattern.breakoutDirection) {
    return pattern.breakoutDirection
  }
  
  // Reversal patterns zijn meestal bearish (behalve double-bottom en inverse head-and-shoulders)
  if (pattern.type === 'double-top' || pattern.type === 'head-and-shoulders' || pattern.type === 'rising-wedge-reversal') {
    return 'bearish'
  }
  
  if (pattern.type === 'double-bottom' || pattern.type === 'inverse-head-and-shoulders' || pattern.type === 'falling-wedge-reversal') {
    return 'bullish'
  }
  
  // Continuation patterns volgen de huidige trend
  if (pattern.type === 'bullish-rectangle' || pattern.type === 'bullish-pennant' || pattern.type === 'rising-wedge-continuation') {
    return 'bullish'
  }
  
  if (pattern.type === 'bearish-rectangle' || pattern.type === 'bearish-pennant' || pattern.type === 'falling-wedge-continuation') {
    return 'bearish'
  }
  
  return 'neutraal'
}

