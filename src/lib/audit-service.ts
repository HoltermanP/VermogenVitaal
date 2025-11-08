import OpenAI from "openai"
import { XMLParser } from "fast-xml-parser"

export interface Transaction {
  datum: string
  omschrijving: string
  bedrag: string | number
  type?: string
  categorie?: string
  btw?: string
  tegenrekening?: string
  factuur?: string
  // Extra velden uit XAF bestand
  period?: string
  sourceID?: string
  custSupID?: string
  recordID?: string
  costDesc?: string
  productDesc?: string
  projectDesc?: string
  [key: string]: string | number | undefined
}

export interface AuditFinding {
  severity: "error" | "warning" | "info"
  category: string
  description: string
  transaction?: Transaction
  recommendation: string
  ruleReference?: string
}

export interface AuditRecommendations {
  critical: string[]
  important: string[]
  suggestions: string[]
  summary: string
}

export function parseXAF(xmlText: string): Transaction[] {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      parseAttributeValue: true,
      trimValues: true,
      removeNSPrefix: true
    })

    const xmlData = parser.parse(xmlText)
    
    // Debug: log de structuur om te zien wat we hebben
    console.log('XAF structure root keys:', Object.keys(xmlData))
    
    // XAF bestanden hebben verschillende mogelijke structuren
    // Probeer verschillende paden om transacties te vinden
    let transactions: Transaction[] = []
    
    // E-boekhouden XAF structuur met kleine letters: auditfile.transactions.journal.transaction
    // Dit is de meest voorkomende structuur in e-Boekhouden XAF bestanden
    if (xmlData.auditfile?.transactions?.journal) {
      const journals = Array.isArray(xmlData.auditfile.transactions.journal)
        ? xmlData.auditfile.transactions.journal
        : [xmlData.auditfile.transactions.journal]
      
      console.log(`Found ${journals.length} journals in auditfile.transactions.journal`)
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      journals.forEach((journal: any, journalIndex: number) => {
        if (journal.transaction) {
          const trans = Array.isArray(journal.transaction) ? journal.transaction : [journal.transaction]
          console.log(`Journal ${journalIndex + 1} has ${trans.length} transaction(s)`)
          transactions.push(...trans)
        } else {
          console.log(`Journal ${journalIndex + 1} has no transactions. Keys:`, Object.keys(journal || {}))
        }
      })
      console.log(`Found ${transactions.length} total transactions via auditfile.transactions.journal path`)
    }
    
    // E-boekhouden XAF structuur met kleine letters: auditfile.generalLedger.journal.transaction
    // Alternatieve structuur (minder gebruikelijk)
    if (xmlData.auditfile?.generalLedger?.journal) {
      const journals = Array.isArray(xmlData.auditfile.generalLedger.journal)
        ? xmlData.auditfile.generalLedger.journal
        : [xmlData.auditfile.generalLedger.journal]
      
      console.log(`Found ${journals.length} journals in auditfile.generalLedger.journal`)
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      journals.forEach((journal: any, journalIndex: number) => {
        if (journal.transaction) {
          const trans = Array.isArray(journal.transaction) ? journal.transaction : [journal.transaction]
          console.log(`Journal ${journalIndex + 1} has ${trans.length} transaction(s)`)
          transactions.push(...trans)
        } else {
          console.log(`Journal ${journalIndex + 1} has no transactions. Keys:`, Object.keys(journal || {}))
        }
      })
      console.log(`Found ${transactions.length} total transactions via auditfile.generalLedger.journal path`)
    }
    
    // E-boekhouden XAF structuur - MasterFiles (hoofdletters)
    if (xmlData.AuditFile?.MasterFiles?.Transaction?.JournalTransaction) {
      const journalTransactions = Array.isArray(xmlData.AuditFile.MasterFiles.Transaction.JournalTransaction)
        ? xmlData.AuditFile.MasterFiles.Transaction.JournalTransaction
        : [xmlData.AuditFile.MasterFiles.Transaction.JournalTransaction]
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      journalTransactions.forEach((journal: any) => {
        if (journal.Transaction) {
          const trans = Array.isArray(journal.Transaction) ? journal.Transaction : [journal.Transaction]
          transactions.push(...trans)
        }
      })
    }
    
    // E-boekhouden XAF structuur - GeneralLedgerEntries (hoofdletters)
    if (xmlData.AuditFile?.GeneralLedgerEntries) {
      // Probeer Journal entries
      if (xmlData.AuditFile.GeneralLedgerEntries.Journal) {
        const journals = Array.isArray(xmlData.AuditFile.GeneralLedgerEntries.Journal)
          ? xmlData.AuditFile.GeneralLedgerEntries.Journal
          : [xmlData.AuditFile.GeneralLedgerEntries.Journal]
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        journals.forEach((journal: any) => {
          if (journal.Transaction) {
            const trans = Array.isArray(journal.Transaction) ? journal.Transaction : [journal.Transaction]
            transactions.push(...trans)
          }
        })
      }
      
      // Probeer direct Transaction entries
      if (xmlData.AuditFile.GeneralLedgerEntries.Transaction) {
        const trans = Array.isArray(xmlData.AuditFile.GeneralLedgerEntries.Transaction)
          ? xmlData.AuditFile.GeneralLedgerEntries.Transaction
          : [xmlData.AuditFile.GeneralLedgerEntries.Transaction]
        transactions.push(...trans)
      }
    }
    
    // Direct Transaction onder AuditFile
    if (xmlData.AuditFile?.Transaction) {
      const trans = Array.isArray(xmlData.AuditFile.Transaction)
        ? xmlData.AuditFile.Transaction
        : [xmlData.AuditFile.Transaction]
      transactions.push(...trans)
    }
    
    // Als er geen AuditFile is, log andere root elementen voor debugging
    if (transactions.length === 0 && !xmlData.AuditFile && !xmlData.auditfile) {
      console.log('No AuditFile or auditfile found, checking other root elements...')
      Object.keys(xmlData).forEach(key => {
        console.log(`Root element "${key}" type:`, Array.isArray(xmlData[key]) ? 'array' : typeof xmlData[key])
        if (typeof xmlData[key] === 'object' && xmlData[key] !== null) {
          console.log(`  "${key}" keys:`, Object.keys(xmlData[key]))
        }
      })
    }
    
    // Als we nog steeds geen transacties hebben, probeer recursief te zoeken
    if (transactions.length === 0) {
      console.log('No transactions found in standard paths, searching recursively...')
      
      // Probeer eerst alle mogelijke paden die vaak voorkomen in XAF bestanden
      const possiblePaths = [
        'auditfile.transactions.journal', // E-boekhouden structuur (kleine letters)
        'auditfile.generalLedger.journal', // Alternatieve structuur
        'AuditFile.GeneralLedgerEntries.Journal',
        'AuditFile.GeneralLedgerEntries',
        'AuditFile.MasterFiles',
        'AuditFile',
        'AuditFile.Transaction',
        'AuditFile.Transactions',
        'AuditFile.Journal',
        'AuditFile.Journals',
        'GeneralLedgerEntries',
        'Transactions',
        'Transaction'
      ]
      
      for (const path of possiblePaths) {
        const parts = path.split('.')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let current: any = xmlData
        for (const part of parts) {
          if (current && typeof current === 'object' && part in current) {
            current = current[part]
          } else {
            current = null
            break
          }
        }
        
        if (current) {
          if (Array.isArray(current)) {
            // Als het een array van journals is, haal transacties eruit
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            current.forEach((item: any) => {
              if (item && typeof item === 'object') {
                if (item.transaction) {
                  const trans = Array.isArray(item.transaction) ? item.transaction : [item.transaction]
                  transactions.push(...trans)
                } else if (item.Transaction) {
                  const trans = Array.isArray(item.Transaction) ? item.Transaction : [item.Transaction]
                  transactions.push(...trans)
                } else {
                  // Mogelijk direct transacties
                  transactions.push(item)
                }
              }
            })
          } else if (typeof current === 'object') {
            // Als het een journal object is, haal transacties eruit
            if (current.transaction) {
              const trans = Array.isArray(current.transaction) ? current.transaction : [current.transaction]
              transactions.push(...trans)
            } else if (current.Transaction) {
              const trans = Array.isArray(current.Transaction) ? current.Transaction : [current.Transaction]
              transactions.push(...trans)
            } else {
              // Mogelijk direct transacties
              transactions.push(current)
            }
          }
        }
      }
      
      // Als nog steeds niets, probeer recursief te zoeken
      if (transactions.length === 0) {
        console.log('Trying recursive search with broader criteria...')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const findTransactions = (obj: any, path: string = '', depth: number = 0): Transaction[] => {
          const found: Transaction[] = []
          
          // Limiteer diepte om stack overflow te voorkomen
          if (depth > 10) return found
          
          if (Array.isArray(obj)) {
            // Als het een array is, check of de items zelf transacties zijn of journals
            obj.forEach((item, index) => {
              if (item && typeof item === 'object') {
                // Check of item een transactie lijkt (inclusief kleine letters)
                const hasTransactionFields = 
                  item.TransactionDate || 
                  item.transactionDate ||
                  item.Date || 
                  item["@_Date"] ||
                  item["@_TransactionDate"] ||
                  item.Description || 
                  item.description ||
                  item["@_Description"] ||
                  item.Amount || 
                  item["@_Amount"] ||
                  item.Line ||
                  item.line ||
                  item.DebitAmount ||
                  item.debitAmount ||
                  item.CreditAmount ||
                  item.creditAmount ||
                  item.AccountID ||
                  item.accountID ||
                  item["@_AccountID"] ||
                  item.transactionID ||
                  item.TransactionID
                
                // Check of item een journal is
                const isJournal = 
                  item.journalID || 
                  item.JournalID ||
                  (item.transaction && (Array.isArray(item.transaction) || typeof item.transaction === 'object')) ||
                  (item.Transaction && (Array.isArray(item.Transaction) || typeof item.Transaction === 'object'))
                
                if (isJournal) {
                  // Haal transacties uit journal
                  if (item.transaction) {
                    const trans = Array.isArray(item.transaction) ? item.transaction : [item.transaction]
                    found.push(...trans)
                  } else if (item.Transaction) {
                    const trans = Array.isArray(item.Transaction) ? item.Transaction : [item.Transaction]
                    found.push(...trans)
                  }
                } else if (hasTransactionFields) {
                  found.push(item)
                } else {
                  // Recursief doorzoeken
                  found.push(...findTransactions(item, `${path}[${index}]`, depth + 1))
                }
              }
            })
          } else if (obj && typeof obj === 'object') {
            // Check of dit een Transaction object is (meer flexibele checks, inclusief kleine letters)
            const hasTransactionFields = 
              obj.TransactionDate || 
              obj.transactionDate ||
              obj.Date || 
              obj["@_Date"] ||
              obj["@_TransactionDate"] ||
              obj.Description || 
              obj.description ||
              obj["@_Description"] ||
              obj.Amount || 
              obj["@_Amount"] ||
              obj.Line ||
              obj.line ||
              obj.DebitAmount ||
              obj.debitAmount ||
              obj.CreditAmount ||
              obj.creditAmount ||
              obj.AccountID ||
              obj.accountID ||
              obj["@_AccountID"] ||
              obj.transactionID ||
              obj.TransactionID ||
              (obj["#text"] && obj["#text"].trim().length > 0) // Text content
            
            // Check of dit een Journal object is (bevat transacties)
            const isJournal = 
              obj.journalID || 
              obj.JournalID ||
              (obj.transaction && (Array.isArray(obj.transaction) || typeof obj.transaction === 'object')) ||
              (obj.Transaction && (Array.isArray(obj.Transaction) || typeof obj.Transaction === 'object'))
            
            if (isJournal) {
              // Haal transacties uit journal
              if (obj.transaction) {
                const trans = Array.isArray(obj.transaction) ? obj.transaction : [obj.transaction]
                found.push(...trans)
              } else if (obj.Transaction) {
                const trans = Array.isArray(obj.Transaction) ? obj.Transaction : [obj.Transaction]
                found.push(...trans)
              }
            } else if (hasTransactionFields) {
              found.push(obj)
            }
            
            // Recursief door alle properties (maar niet te diep)
            Object.keys(obj).forEach(key => {
              const lowerKey = key.toLowerCase()
              // Zoek in meer velden
              if (lowerKey.includes('transaction') || 
                  lowerKey.includes('journal') || 
                  lowerKey.includes('entry') ||
                  lowerKey.includes('line') ||
                  lowerKey.includes('movement') ||
                  lowerKey.includes('record') ||
                  depth < 5) { // In eerste 5 lagen, doorzoek alles
                found.push(...findTransactions(obj[key], `${path}.${key}`, depth + 1))
              }
            })
          }
          
          return found
        }
        
        const recursiveTransactions = findTransactions(xmlData)
        if (recursiveTransactions.length > 0) {
          console.log(`Found ${recursiveTransactions.length} potential transactions via recursive search`)
          transactions.push(...recursiveTransactions)
        } else {
          console.error('Recursive search found nothing. XML structure might be very different.')
          // Als laatste redmiddel: accepteer ALLE objecten die data bevatten
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const allObjects: any[] = []
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const collectAllObjects = (obj: any, depth: number = 0): void => {
            if (depth > 8) return
            if (Array.isArray(obj)) {
              obj.forEach(item => collectAllObjects(item, depth + 1))
            } else if (obj && typeof obj === 'object') {
              if (Object.keys(obj).length > 0) {
                allObjects.push(obj)
              }
              Object.keys(obj).forEach(key => {
                collectAllObjects(obj[key], depth + 1)
              })
            }
          }
          collectAllObjects(xmlData)
          console.log(`Collected ${allObjects.length} objects from XML. Using first 100 as potential transactions.`)
          transactions.push(...allObjects.slice(0, 100))
        }
      }
    }
    
    console.log(`Found ${transactions.length} raw transactions in XAF file`)
    
    // Als we nog steeds geen transacties hebben, probeer alle arrays in de XML
    if (transactions.length === 0) {
      console.log('No transactions found, trying to extract all arrays from XML...')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const extractArrays = (obj: any, path: string = '', depth: number = 0): any[] => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const arrays: any[] = []
        if (depth > 10) return arrays
        
        if (Array.isArray(obj)) {
          // Als het een array is met objecten die eruitzien als transacties
          if (obj.length > 0 && obj[0] && typeof obj[0] === 'object') {
            arrays.push(...obj)
          }
          // Recursief door items
          obj.forEach((item, idx) => {
            arrays.push(...extractArrays(item, `${path}[${idx}]`, depth + 1))
          })
        } else if (obj && typeof obj === 'object') {
          Object.keys(obj).forEach(key => {
            const value = obj[key]
            if (Array.isArray(value) && value.length > 0) {
              // Check of items in array op transacties lijken
              const firstItem = value[0]
              if (firstItem && typeof firstItem === 'object') {
                // Check op transactie-achtige velden
                const hasTransactionLikeFields = 
                  firstItem.Date || firstItem.TransactionDate || firstItem.Amount || 
                  firstItem.Description || firstItem.Line || firstItem.AccountID ||
                  Object.keys(firstItem).some(k => k.toLowerCase().includes('date') || 
                                                 k.toLowerCase().includes('amount') ||
                                                 k.toLowerCase().includes('description'))
                
                if (hasTransactionLikeFields || value.length > 5) {
                  console.log(`Found potential transaction array at ${path}.${key} with ${value.length} items`)
                  arrays.push(...value)
                }
              }
            }
            arrays.push(...extractArrays(value, `${path}.${key}`, depth + 1))
          })
        }
        return arrays
      }
      
      const allArrays = extractArrays(xmlData)
      console.log(`Extracted ${allArrays.length} potential transaction objects from arrays`)
      
      if (allArrays.length > 0) {
        // Filter op objecten die eruitzien als transacties
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filtered = allArrays.filter((item: any) => {
          if (!item || typeof item !== 'object') return false
          const keys = Object.keys(item)
          return keys.length > 0 && (
            item.Date || item.TransactionDate || item.Amount || item.Description ||
            item.Line || item.AccountID || item.DebitAmount || item.CreditAmount ||
            keys.some(k => k.toLowerCase().includes('date') || 
                          k.toLowerCase().includes('amount') ||
                          k.toLowerCase().includes('description') ||
                          k.toLowerCase().includes('account'))
          )
        })
        
        console.log(`Filtered to ${filtered.length} transaction-like objects`)
        transactions.push(...filtered.slice(0, 500)) // Limiteer tot 500 om performance te behouden
      }
    }

    console.log(`Final count: ${transactions.length} raw transactions to process`)
    
    // Log eerste paar transacties om te zien wat we hebben
    if (transactions.length > 0) {
      console.log('Sample transaction keys:', Object.keys(transactions[0]))
      console.log('Sample transaction:', JSON.stringify(transactions[0]).substring(0, 300))
    }

    // Converteer XAF transacties naar ons Transaction formaat
    const result: Transaction[] = []
    
    // Helper functie om diep te zoeken in object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deepGet = (obj: any, paths: string[]): any => {
      for (const path of paths) {
        const parts = path.split('.')
        let current = obj
        for (const part of parts) {
          if (current && typeof current === 'object') {
            // Ondersteun array indexen zoals Line[0]
            const arrayMatch = part.match(/^(.+)\[(\d+)\]$/)
            if (arrayMatch) {
              const arrayName = arrayMatch[1]
              const arrayIndex = parseInt(arrayMatch[2])
              const array = current[arrayName] || current[`@_${arrayName}`]
              if (Array.isArray(array) && array[arrayIndex] !== undefined) {
                current = array[arrayIndex]
              } else {
                current = null
                break
              }
            } else {
              current = current[part] || current[`@_${part}`]
            }
          } else {
            current = null
            break
          }
        }
        if (current !== null && current !== undefined && current !== '') {
          return current
        }
      }
      return null
    }
    
    // Helper functie om bedrag te parsen (ondersteun verschillende formaten)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parseAmount = (value: any): number => {
      if (!value) return 0
      if (typeof value === 'number') return value
      const str = String(value).replace(/[€$£\s]/g, '').replace(/\./g, '').replace(',', '.')
      const num = parseFloat(str)
      return isNaN(num) ? 0 : num
    }
    
    let skippedCount = 0
    let processedCount = 0
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transactions.forEach((xafTrans: any, index: number) => {
      // Filter: alleen echte transacties accepteren (moet transactionID hebben of line entries)
      const hasTransactionID = xafTrans.transactionID || xafTrans.TransactionID || xafTrans.transactionId
      const lineArray = xafTrans.Line || xafTrans.line
      const hasLines = lineArray && (Array.isArray(lineArray) ? lineArray.length > 0 : lineArray !== null)
      
      // Skip als het geen echte transactie is (geen transactionID en geen line entries)
      if (!hasTransactionID && !hasLines) {
        skippedCount++
        if (index < 5) {
          console.log(`Skipping transaction ${index + 1}: no transactionID or lines. Keys:`, Object.keys(xafTrans))
        }
        return // Skip deze entry
      }
      
      processedCount++
      
      // Log eerste paar transacties voor debugging
      if (index < 3) {
        console.log(`Transaction ${index + 1} keys:`, Object.keys(xafTrans))
        console.log(`Transaction ${index + 1} sample:`, JSON.stringify(xafTrans).substring(0, 500))
      }
      
      // Probeer verschillende velden voor datum (veel meer opties, inclusief kleine letters)
      let datum = deepGet(xafTrans, [
        'transactionDate', 'TransactionDate', 'Date', '@_Date', '@_TransactionDate',
        'TransactionHeader.TransactionDate', 'Header.TransactionDate',
        'PeriodStart', 'PeriodEnd', 'EntryDate', 'PostingDate',
        'SourceDocumentID.Date', 'DocumentDate'
      ]) || ""
      
      // Probeer verschillende velden voor omschrijving (veel meer opties, inclusief kleine letters)
      let omschrijving = deepGet(xafTrans, [
        'description', 'Description', '@_Description', 'TransactionHeader.Description',
        'Header.Description', 'Comment', 'Narrative', 'Reference',
        'Remarks', 'Memo', 'Text'
      ]) || ""
      
      // Probeer bedrag te vinden - vaak in Line entries
      let bedrag = 0
      let type = ""
      let categorie = ""
      let btw = ""
      let tegenrekening = ""
      let factuur = ""
      let period = ""
      let sourceID = ""
      let custSupID = ""
      let recordID = ""
      let costDesc = ""
      let productDesc = ""
      let projectDesc = ""
      
      // Haal period en sourceID uit transaction
      period = deepGet(xafTrans, [
        'period', 'Period', '@_Period'
      ]) || ""
      
      sourceID = deepGet(xafTrans, [
        'sourceID', 'SourceID', 'sourceId', '@_SourceID'
      ]) || ""
      
      // XAF heeft vaak Line entries met debit/credit - dit is de belangrijkste bron
      // Ondersteun zowel Line (hoofdletters) als line (kleine letters)
      if (lineArray) {
        const lines = Array.isArray(lineArray) ? lineArray : [lineArray]
        
        // Verzamel alle bedragen en andere info uit de lines
        let totalDebit = 0
        let totalCredit = 0
        const accountIDs: string[] = []
        const documentIDs: string[] = []
        const custSupIDs: string[] = []
        const recordIDs: string[] = []
        const costDescs: string[] = []
        const productDescs: string[] = []
        const projectDescs: string[] = []
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        lines.forEach((line: any) => {
          // Probeer verschillende velden voor debit/credit (veel meer opties, inclusief kleine letters)
          const debit = parseAmount(deepGet(line, [
            'debitAmount', 'DebitAmount', '@_DebitAmount', 'Debit', '@_Debit'
          ]))
          
          const credit = parseAmount(deepGet(line, [
            'creditAmount', 'CreditAmount', '@_CreditAmount', 'Credit', '@_Credit'
          ]))
          
          totalDebit += debit
          totalCredit += credit
          
          // Bereken netto bedrag: debit - credit (debit is positief, credit is negatief)
          // Voor een transactie: we willen het totaal van alle debits min alle credits
          
          // Probeer categorie/account te vinden (veel meer opties, inclusief kleine letters)
          const accountID = deepGet(line, [
            'accountID', 'AccountID', '@_AccountID', 'Account', '@_Account',
            'AccountCode', 'AccountNumber'
          ])
          if (accountID && !accountIDs.includes(String(accountID))) {
            accountIDs.push(String(accountID))
          }
          
          // Haal recordID uit line
          const recID = deepGet(line, [
            'recordID', 'RecordID', 'recordId', '@_RecordID'
          ])
          if (recID && !recordIDs.includes(String(recID))) {
            recordIDs.push(String(recID))
          }
          
          // Haal custSupID uit line (klant/leverancier ID)
          const custSup = deepGet(line, [
            'custSupID', 'CustSupID', 'custSupId', '@_CustSupID',
            'CustomerID', 'SupplierID', 'CustomerSupplierID'
          ])
          if (custSup && !custSupIDs.includes(String(custSup))) {
            custSupIDs.push(String(custSup))
          }
          
          // Haal costDesc, productDesc, projectDesc uit line
          const cost = deepGet(line, [
            'costDesc', 'CostDesc', 'costDescription', 'CostDescription'
          ])
          if (cost && cost.trim() !== '' && !costDescs.includes(String(cost))) {
            costDescs.push(String(cost))
          }
          
          const product = deepGet(line, [
            'productDesc', 'ProductDesc', 'productDescription', 'ProductDescription'
          ])
          if (product && product.trim() !== '' && !productDescs.includes(String(product))) {
            productDescs.push(String(product))
          }
          
          const project = deepGet(line, [
            'projectDesc', 'ProjectDesc', 'projectDescription', 'ProjectDescription'
          ])
          if (project && project.trim() !== '' && !projectDescs.includes(String(project))) {
            projectDescs.push(String(project))
          }
          
          // Probeer BTW informatie (inclusief kleine letters vat structuur)
          if (!btw) {
            const vatCode = deepGet(line, [
              'vat.vatCode', 'VAT.VATCode', 'vatCode', 'VATCode',
              'TaxInformation.TaxRate', 'TaxInformation.@_Rate',
              'TaxInformation.TaxPercentage', 'TaxRate', '@_TaxRate',
              'VATRate', 'VATPercentage'
            ])
            const vatAmount = deepGet(line, [
              'vat.vatAmount', 'VAT.VATAmount', 'vatAmount', 'VATAmount'
            ])
            if (vatCode) {
              btw = vatCode
              if (vatAmount) {
                btw += ` (${vatAmount})`
              }
            }
          }
          
          // Probeer omschrijving uit line (veel meer opties, inclusief kleine letters)
          // Alleen als omschrijving nog leeg is
          if (!omschrijving || omschrijving.trim() === '') {
            const lineDesc = deepGet(line, [
              'description', 'Description', '@_Description', 'Narrative', 'Comment',
              'Text', 'Memo'
            ])
            if (lineDesc && lineDesc.trim() !== '') {
              omschrijving = lineDesc
            }
          }
          
          // Probeer datum uit line als die nog niet gevonden is
          if (!datum || datum.trim() === '') {
            const lineDate = deepGet(line, [
              'effectiveDate', 'EffectiveDate', 'Date', '@_Date'
            ])
            if (lineDate && lineDate.trim() !== '') {
              datum = lineDate
            }
          }
          
          // Probeer tegenrekening
          if (!tegenrekening) {
            tegenrekening = deepGet(line, [
              'CounterpartAccountID', 'CounterpartAccount',
              'RelatedAccountID', 'RelatedAccount'
            ]) || ""
          }
          
          // Probeer factuurnummer uit line (inclusief kleine letters)
          const docID = deepGet(line, [
            'documentID', 'DocumentID', 'documentId',
            'SourceDocumentID', 'DocumentNumber', 'InvoiceNumber',
            'Reference'
          ])
          if (docID && !documentIDs.includes(String(docID))) {
            documentIDs.push(String(docID))
          }
        })
        
        // Sla verzamelde waarden op
        if (recordIDs.length > 0) {
          recordID = recordIDs.join(', ')
        }
        if (custSupIDs.length > 0) {
          custSupID = custSupIDs.join(', ')
        }
        if (costDescs.length > 0) {
          costDesc = costDescs.join('; ')
        }
        if (productDescs.length > 0) {
          productDesc = productDescs.join('; ')
        }
        if (projectDescs.length > 0) {
          projectDesc = projectDescs.join('; ')
        }
        
        // Bereken bedrag: voor boekhoudtransacties willen we het grootste absolute bedrag
        // Dit is meestal de hoofdtransactie (bijv. een factuurbedrag)
        if (totalDebit > 0 || totalCredit > 0) {
          // Neem het grootste absolute bedrag (meestal is dit de hoofdtransactie)
          // Als er alleen debits zijn, is het een positief bedrag
          // Als er alleen credits zijn, is het een negatief bedrag
          // Als er beide zijn, neem het grootste absolute bedrag met het juiste teken
          if (totalDebit >= totalCredit) {
            bedrag = totalDebit
            // Als er ook credits zijn, trek die eraf (maar behoud het teken van de grootste)
            if (totalCredit > 0) {
              // Voor een factuur: debit is omzet, credit is BTW - we willen het totaal (debit)
              // Voor een kosten: debit is kosten, credit is crediteuren - we willen het totaal (debit)
              bedrag = totalDebit // Neem het grootste (meestal de hoofdtransactie)
            }
          } else {
            bedrag = -totalCredit // Credit is negatief (bijv. betaling)
          }
        }
        
        // Gebruik eerste accountID als categorie
        if (accountIDs.length > 0 && !categorie) {
          categorie = accountIDs[0]
        }
        
        // Gebruik eerste documentID als factuur
        if (documentIDs.length > 0 && !factuur) {
          factuur = documentIDs[0]
        }
      }
      
      // Als geen Line entries, probeer directe velden (veel meer opties)
      if (bedrag === 0) {
        bedrag = parseAmount(deepGet(xafTrans, [
          'Amount', '@_Amount', 'TransactionAmount', 'TotalAmount',
          'Value', 'MonetaryValue'
        ]))
      }
      
      if (!categorie) {
        categorie = deepGet(xafTrans, [
          'AccountID', '@_AccountID', 'Account', '@_Account',
          'AccountCode', 'AccountNumber', 'AccountDescription'
        ]) || ""
      }
      
      if (!type) {
        type = deepGet(xafTrans, [
          'TransactionType', 'Type', '@_Type', 'EntryType',
          'DocumentType', 'SourceDocumentID.Type'
        ]) || ""
      }
      
      // Probeer factuurnummer (inclusief kleine letters)
      if (!factuur) {
        factuur = deepGet(xafTrans, [
          'transactionID', 'TransactionID', 'transactionId',
          'SourceDocumentID', 'DocumentNumber', 'InvoiceNumber',
          'Reference', 'DocumentID'
        ]) || ""
      }
      
      // Als we nog steeds geen omschrijving hebben, gebruik transactionID of een generieke omschrijving
      if (!omschrijving || omschrijving.trim() === '') {
        const transID = hasTransactionID || deepGet(xafTrans, ['transactionID', 'TransactionID', 'transactionId'])
        if (transID) {
          omschrijving = `Transactie ${transID}`
        } else {
          omschrijving = `Transactie ${index + 1}`
        }
      }
      
      // Accepteer transactie als het een echte transactie is (heeft transactionID of line entries)
      // Als er line entries zijn, accepteer altijd (zelfs als bedrag 0 is - kan een balans transactie zijn)
      // Als er geen line entries zijn maar wel transactionID, accepteer als er minimaal een bedrag OF datum is
      const hasValidData = hasLines || (hasTransactionID && (bedrag !== 0 || (datum && datum.trim() !== '')))
      
      if (hasValidData) {
        
        // Format datum naar YYYY-MM-DD indien nodig
        if (datum && typeof datum === 'string') {
          // Probeer verschillende datum formaten
          const dateMatch = datum.match(/(\d{4})-(\d{2})-(\d{2})/) || 
                           datum.match(/(\d{2})\/(\d{2})\/(\d{4})/) ||
                           datum.match(/(\d{2})-(\d{2})-(\d{4})/) ||
                           datum.match(/(\d{4})(\d{2})(\d{2})/) // YYYYMMDD
          
          if (dateMatch) {
            if (dateMatch[0].includes('/') || (dateMatch[0].includes('-') && dateMatch[0].length === 10)) {
              // DD/MM/YYYY of DD-MM-YYYY naar YYYY-MM-DD
              const parts = dateMatch[0].split(/[\/\-]/)
              if (parts.length === 3) {
                if (parts[0].length === 4) {
                  // YYYY-MM-DD of YYYY/MM/DD
                  datum = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
                } else {
                  // DD-MM-YYYY of DD/MM/YYYY
                  datum = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
                }
              }
            } else if (dateMatch[0].length === 8 && !dateMatch[0].includes('-') && !dateMatch[0].includes('/')) {
              // YYYYMMDD
              datum = `${dateMatch[0].substring(0, 4)}-${dateMatch[0].substring(4, 6)}-${dateMatch[0].substring(6, 8)}`
            }
          }
        }
        
        result.push({
          datum: datum || new Date().toISOString().split('T')[0], // Fallback naar vandaag
          omschrijving: omschrijving || "Geen omschrijving",
          bedrag: bedrag,
          type: type || "",
          categorie: categorie || "",
          btw: btw || "",
          tegenrekening: tegenrekening || "",
          factuur: factuur || "",
          // Extra velden uit XAF bestand
          period: period || "",
          sourceID: sourceID || "",
          custSupID: custSupID || "",
          recordID: recordID || "",
          costDesc: costDesc || "",
          productDesc: productDesc || "",
          projectDesc: projectDesc || "",
          raw: xafTrans // Bewaar raw data voor debugging
        })
      } else {
        skippedCount++
        if (index < 5) {
          console.log(`Skipping transaction ${index + 1}: no valid data. Has transactionID: ${hasTransactionID}, hasLines: ${hasLines}, bedrag: ${bedrag}, datum: ${datum}, omschrijving: ${omschrijving}`)
        }
      }
    })
    
    console.log(`Converted ${result.length} transactions from XAF format (processed: ${processedCount}, skipped: ${skippedCount})`)
    
    if (result.length === 0) {
      // Als we geen transacties hebben gevonden, log de structuur voor debugging
      console.error('XAF parsing resulted in 0 transactions')
      console.error('XML root keys:', Object.keys(xmlData))
      if (xmlData.AuditFile) {
        console.error('AuditFile structure:', JSON.stringify(Object.keys(xmlData.AuditFile), null, 2))
        // Log eerste 1000 karakters van de structuur
        const structurePreview = JSON.stringify(xmlData.AuditFile, null, 2).substring(0, 1000)
        console.error('AuditFile preview:', structurePreview)
      }
      if (xmlData.auditfile) {
        console.error('auditfile structure:', JSON.stringify(Object.keys(xmlData.auditfile), null, 2))
        // Log eerste 1000 karakters van de structuur
        const structurePreview = JSON.stringify(xmlData.auditfile, null, 2).substring(0, 1000)
        console.error('auditfile preview:', structurePreview)
      }
    }
    
    return result
  } catch (error) {
    console.error("Error parsing XAF file:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace')
    throw new Error(`XAF bestand kon niet worden geparsed: ${error instanceof Error ? error.message : 'Onbekende fout'}. Controleer of het een geldig XAF bestand is.`)
  }
}

export function parseCSV(csvText: string): Transaction[] {
  const lines = csvText.split('\n').filter(line => line.trim())
  console.log(`CSV parsing: Found ${lines.length} lines`)
  if (lines.length === 0) {
    console.error('CSV file is empty')
    return []
  }
  
  // Probeer verschillende scheidingstekens
  const separators = [',', ';', '\t']
  let separator = ','
  
  // Tel voorkomens van elke separator in eerste regel
  for (const sep of separators) {
    const count = (lines[0].match(new RegExp(sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
    if (count > 0) {
      separator = sep
      console.log(`Using separator: "${sep}" (found ${count} times in header)`)
      break
    }
  }
  
  // Parse header regel - ondersteun verschillende encoding
  let headerLine = lines[0]
  // Probeer BOM te verwijderen (UTF-8 BOM)
  if (headerLine.charCodeAt(0) === 0xFEFF) {
    headerLine = headerLine.substring(1)
  }
  
  // Parse headers met quotes
  const parseCSVLine = (line: string, sep: string): string[] => {
    const values: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      const nextChar = line[j + 1]
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"'
          j++ // Skip next quote
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === sep && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim()) // Add last value
    return values
  }
  
  const headers = parseCSVLine(headerLine, separator)
    .map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''))
  
  console.log(`CSV headers (${headers.length}):`, headers)
  
  // Probeer verschillende kolomnamen te herkennen
  const findColumnIndex = (possibleNames: string[]): number => {
    for (const name of possibleNames) {
      const index = headers.findIndex(h => 
        h === name || 
        h.includes(name) || 
        name.includes(h) ||
        h.replace(/[^a-z]/g, '') === name.replace(/[^a-z]/g, '')
      )
      if (index >= 0) return index
    }
    return -1
  }
  
  const dateIndex = findColumnIndex(['datum', 'date', 'transactiedatum', 'boekdatum'])
  const descriptionIndex = findColumnIndex(['omschrijving', 'description', 'beschrijving', 'commentaar', 'tekst'])
  const amountIndex = findColumnIndex(['bedrag', 'amount', 'aantal', 'waarde', 'saldo'])
  const typeIndex = findColumnIndex(['type', 'soort', 'categorie'])
  const categoryIndex = findColumnIndex(['categorie', 'category', 'rekening', 'account'])
  const vatIndex = findColumnIndex(['btw', 'vat', 'belasting', 'tax'])
  const tegenrekeningIndex = findColumnIndex(['tegenrekening', 'tegen_rekening', 'tegenrekeningnummer', 'counter_account'])
  const factuurIndex = findColumnIndex(['factuur', 'invoice', 'factuurnummer', 'invoice_number'])
  const nrIndex = findColumnIndex(['nr', 'nummer', 'number', 'id', 'transaction_id'])
  
  console.log('Column mapping:', {
    date: dateIndex >= 0 ? headers[dateIndex] : 'not found',
    description: descriptionIndex >= 0 ? headers[descriptionIndex] : 'not found',
    amount: amountIndex >= 0 ? headers[amountIndex] : 'not found',
    type: typeIndex >= 0 ? headers[typeIndex] : 'not found',
    category: categoryIndex >= 0 ? headers[categoryIndex] : 'not found',
    vat: vatIndex >= 0 ? headers[vatIndex] : 'not found',
    tegenrekening: tegenrekeningIndex >= 0 ? headers[tegenrekeningIndex] : 'not found',
    factuur: factuurIndex >= 0 ? headers[factuurIndex] : 'not found',
    nr: nrIndex >= 0 ? headers[nrIndex] : 'not found'
  })
  
  // Helper functie om DD-MM-YYYY naar YYYY-MM-DD te converteren
  const parseDutchDate = (dateStr: string): string => {
    if (!dateStr || !dateStr.trim()) return ''
    
    // Verwijder quotes en trim
    dateStr = dateStr.replace(/^"|"$/g, '').trim()
    
    // Probeer DD-MM-YYYY formaat
    const ddMMyyyyMatch = dateStr.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/)
    if (ddMMyyyyMatch) {
      const [, day, month, year] = ddMMyyyyMatch
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
    
    // Probeer YYYY-MM-DD formaat (als het al correct is)
    const yyyyMMddMatch = dateStr.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/)
    if (yyyyMMddMatch) {
      const [, year, month, day] = yyyyMMddMatch
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
    
    // Als het niet matcht, return origineel (wordt later gevalideerd)
    return dateStr
  }
  
  const transactions: Transaction[] = []
  let skippedCount = 0
  let processedCount = 0
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Skip volledig lege regels
    if (!line) {
      skippedCount++
      continue
    }
    
    // Skip regels die alleen separators bevatten (maar niet te strikt)
    if (line.replace(new RegExp(separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '').trim().length === 0) {
      skippedCount++
      continue
    }
    
    processedCount++
    
    try {
      const values = parseCSVLine(line, separator)
      
      // Skip als er geen waarden zijn
      if (values.length === 0 || values.every(v => !v || v.trim() === '')) {
        skippedCount++
        continue
      }
      
      // Vul transaction object
      const transaction: Transaction = {
        datum: '',
        omschrijving: '',
        bedrag: ''
      }
      
      // Map alle kolommen (ook als ze niet in de header staan)
      headers.forEach((header, index) => {
        if (index < values.length) {
          const value = values[index]?.replace(/^"|"$/g, '').trim() || ''
          transaction[header] = value
        }
      })
      
      // Zorg dat vereiste velden zijn ingevuld
      if (!transaction.datum && transaction['Datum']) {
        transaction.datum = String(transaction['Datum'])
      }
      if (!transaction.omschrijving && transaction['Omschrijving']) {
        transaction.omschrijving = String(transaction['Omschrijving'])
      }
      if (!transaction.bedrag && transaction['Bedrag']) {
        transaction.bedrag = transaction['Bedrag']
      }
      
      // Map ook alle extra kolommen die niet in header staan
      for (let idx = headers.length; idx < values.length; idx++) {
        transaction[`kolom_${idx}`] = values[idx]?.replace(/^"|"$/g, '').trim() || ''
      }
      
      // Map specifieke velden naar standaard namen
      if (dateIndex >= 0 && dateIndex < values.length && values[dateIndex]) {
        const dateValue = values[dateIndex].replace(/^"|"$/g, '').trim()
        transaction.datum = parseDutchDate(dateValue)
      }
      
      if (descriptionIndex >= 0 && descriptionIndex < values.length && values[descriptionIndex]) {
        transaction.omschrijving = values[descriptionIndex].replace(/^"|"$/g, '').trim()
      } else {
        // Genereer omschrijving uit beschikbare velden als er geen expliciete omschrijving is
        const descParts: string[] = []
        if (typeIndex >= 0 && typeIndex < values.length && values[typeIndex]) {
          descParts.push(values[typeIndex].replace(/^"|"$/g, '').trim())
        }
        if (categoryIndex >= 0 && categoryIndex < values.length && values[categoryIndex]) {
          descParts.push(`Rekening: ${values[categoryIndex].replace(/^"|"$/g, '').trim()}`)
        }
        if (tegenrekeningIndex >= 0 && tegenrekeningIndex < values.length && values[tegenrekeningIndex]) {
          const tegenrekening = values[tegenrekeningIndex].replace(/^"|"$/g, '').trim()
          if (tegenrekening) {
            descParts.push(`Tegenrekening: ${tegenrekening}`)
          }
        }
        if (factuurIndex >= 0 && factuurIndex < values.length && values[factuurIndex]) {
          const factuur = values[factuurIndex].replace(/^"|"$/g, '').trim()
          if (factuur) {
            descParts.push(`Factuur: ${factuur}`)
          }
        }
        transaction.omschrijving = descParts.length > 0 ? descParts.join(' | ') : ''
      }
      
      if (amountIndex >= 0 && amountIndex < values.length && values[amountIndex]) {
        // Probeer bedrag te parsen (ondersteun verschillende formaten)
        let amountStr = values[amountIndex].replace(/^"|"$/g, '').trim()
        // Verwijder currency symbolen en spaties
        amountStr = amountStr.replace(/[€$£\s]/g, '')
        
        // Nederlandse notatie: 1.000,00 (punt = duizendtallen, komma = decimalen)
        if (amountStr.match(/^\d{1,3}(\.\d{3})*(,\d{1,2})?$/)) {
          // Verwijder duizendtallen punten en vervang komma door punt
          amountStr = amountStr.replace(/\./g, '').replace(',', '.')
        } 
        // Amerikaanse notatie: 1,234.56 (komma = duizendtallen, punt = decimalen)
        else if (amountStr.match(/^\d{1,3}(,\d{3})*(\.\d{1,2})?$/)) {
          // Verwijder duizendtallen komma's
          amountStr = amountStr.replace(/,/g, '')
        } 
        // Alleen komma: waarschijnlijk decimaal scheidingsteken (Nederlands)
        else if (amountStr.includes(',') && !amountStr.includes('.')) {
          amountStr = amountStr.replace(',', '.')
        }
        // Alleen punt: kan duizendtallen zijn OF decimaal (afhankelijk van context)
        else if (amountStr.includes('.') && !amountStr.includes(',')) {
          // Als er meer dan 3 cijfers na de punt zijn, is het waarschijnlijk duizendtallen
          const dotIndex = amountStr.indexOf('.')
          if (dotIndex >= 0 && amountStr.length - dotIndex > 4) {
            // Verwijder punt (duizendtallen)
            amountStr = amountStr.replace('.', '')
          }
          // Anders is het waarschijnlijk een decimaal punt (Amerikaanse notatie)
        }
        
        transaction.bedrag = amountStr
      }
      
      if (typeIndex >= 0 && typeIndex < values.length && values[typeIndex]) {
        const soortValue = values[typeIndex].replace(/^"|"$/g, '').trim()
        transaction.type = soortValue
        transaction.soort = soortValue // Ook als "soort" bewaren
      }
      
      if (categoryIndex >= 0 && categoryIndex < values.length && values[categoryIndex]) {
        const rekeningValue = values[categoryIndex].replace(/^"|"$/g, '').trim()
        transaction.categorie = rekeningValue
        transaction.rekening = rekeningValue // Ook als "rekening" bewaren
      }
      
      if (vatIndex >= 0 && vatIndex < values.length && values[vatIndex]) {
        transaction.btw = values[vatIndex].replace(/^"|"$/g, '').trim()
      }
      
      // Bewaar extra velden voor latere analyse
      if (tegenrekeningIndex >= 0 && tegenrekeningIndex < values.length) {
        transaction.tegenrekening = values[tegenrekeningIndex].replace(/^"|"$/g, '').trim()
      }
      
      if (factuurIndex >= 0 && factuurIndex < values.length) {
        transaction.factuur = values[factuurIndex].replace(/^"|"$/g, '').trim()
      }
      
      if (nrIndex >= 0 && nrIndex < values.length) {
        transaction.nr = values[nrIndex].replace(/^"|"$/g, '').trim()
      }
      
      // Accepteer transactie als er minimaal één veld gevuld is
      // Maak acceptatie veel soepeler
      const hasAnyData = 
        transaction.datum || 
        transaction.omschrijving || 
        (transaction.bedrag && transaction.bedrag !== '0' && transaction.bedrag !== '') ||
        values.some(v => v && v.trim() !== '')
      
      if (hasAnyData) {
        // Zorg dat bedrag een nummer is
        if (transaction.bedrag && typeof transaction.bedrag === 'string') {
          const numValue = parseFloat(transaction.bedrag)
          transaction.bedrag = isNaN(numValue) ? 0 : numValue
        } else if (!transaction.bedrag) {
          transaction.bedrag = 0
        }
        
        // Zorg voor fallback waarden
        if (!transaction.datum) {
          transaction.datum = ''
        }
        if (!transaction.omschrijving) {
          // Probeer omschrijving uit andere velden te halen
          transaction.omschrijving = values.find(v => v && v.trim() && v.trim().length > 3) || ''
        }
        
        transactions.push(transaction)
      } else {
        skippedCount++
        if (i <= 5) {
          console.log(`Skipping line ${i}: no data found`, values)
        }
      }
    } catch (parseError) {
      console.error(`Error parsing line ${i}:`, parseError, line.substring(0, 100))
      skippedCount++
    }
  }
  
  console.log(`CSV processing: ${processedCount} lines processed, ${transactions.length} transactions created, ${skippedCount} lines skipped`)
  
  console.log(`CSV parsing: Converted ${transactions.length} transactions from ${lines.length - 1} data lines`)
  
  if (transactions.length === 0) {
    console.error('CSV parsing resulted in 0 transactions')
    console.error('Headers found:', headers)
    console.error('First 3 data lines:', lines.slice(1, 4))
    console.error('Sample parsed values from first line:', lines.length > 1 ? parseCSVLine(lines[1], separator) : 'none')
  } else {
    console.log('Sample transaction:', transactions[0])
  }
  
  return transactions
}

export async function generateQuestionsWithAI(
  transactions: Transaction[],
  openai: OpenAI
): Promise<string[]> {
  try {
    const transactionSummary = {
      total: transactions.length,
      dateRange: getDateRange(transactions),
      hasInvoices: transactions.some(t => 
        t.type?.toLowerCase().includes('factuur') || 
        t.omschrijving?.toLowerCase().includes('factuur')
      ),
      hasExpenses: transactions.some(t => {
        const amount = parseFloat(String(t.bedrag || 0))
        return amount < 0
      }),
      largeTransactions: transactions.filter(t => 
        Math.abs(parseFloat(String(t.bedrag || 0))) > 10000
      ).length
    }

    const prompt = `Je bent een Nederlandse belastingexpert. Op basis van de volgende administratiegegevens, genereer 5-7 relevante vragen die nodig zijn om een accurate belastingcontrole uit te voeren volgens de Nederlandse belastingregels 2025.

Administratie samenvatting:
- Aantal transacties: ${transactionSummary.total}
- Datum bereik: ${transactionSummary.dateRange}
- Bevat facturen: ${transactionSummary.hasInvoices ? 'Ja' : 'Nee'}
- Bevat kosten: ${transactionSummary.hasExpenses ? 'Ja' : 'Nee'}
- Grote transacties (>€10.000): ${transactionSummary.largeTransactions}

Genereer vragen die helpen bij:
1. Het bepalen van de rechtsvorm (EMZ/BV/DGA)
2. Het controleren van BTW administratie
3. Het verifiëren van aftrekbare kosten
4. Het controleren van periodisering
5. Specifieke aandachtspunten voor deze administratie

Geef alleen de vragen terug, één per regel, zonder nummering.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Je bent een ervaren Nederlandse belastingadviseur gespecialiseerd in belastingregels 2025. Je stelt altijd relevante en specifieke vragen."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const questionsText = response.choices[0]?.message?.content || ""
    const questions = questionsText
      .split('\n')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.match(/^\d+[\.\)]/))
      .slice(0, 7)

    // Voeg altijd standaard vragen toe
    const defaultQuestions = [
      "Wat is de rechtsvorm van je onderneming? (EMZ/BV/DGA)",
      "Wat is het belastingjaar van deze administratie?"
    ]

    return [...defaultQuestions, ...questions].slice(0, 7)
  } catch (error) {
    console.error("Error generating questions with AI:", error)
    // Fallback naar standaard vragen
    return [
      "Wat is de rechtsvorm van je onderneming? (EMZ/BV/DGA)",
      "Wat is het belastingjaar van deze administratie?",
      "Zijn alle facturen correct geboekt in de juiste periode?",
      "Zijn alle kosten aftrekbaar volgens de belastingregels 2025?",
      "Zijn er grote transacties die extra toelichting vereisen?"
    ]
  }
}

export async function analyzeTransactionsWithAI(
  transactions: Transaction[],
  answers: Record<string, string>,
  openai: OpenAI
): Promise<{ findings: AuditFinding[], recommendations: AuditRecommendations }> {
  try {
    // Valideer input
    if (!transactions || transactions.length === 0) {
      throw new Error("Geen transacties om te analyseren")
    }
    
    if (!answers || typeof answers !== 'object') {
      throw new Error("Geen antwoorden ontvangen")
    }
    
    console.log(`Analyzing ${transactions.length} transactions with AI`)
    
    const legalForm = answers.legalForm || 
                     answers["Wat is de rechtsvorm van je onderneming?"] || 
                     answers["q0"]?.includes("EMZ") ? "EMZ" :
                     answers["q0"]?.includes("BV") ? "BV" :
                     answers["q0"]?.includes("DGA") ? "DGA" : "EMZ"
    
    const taxYear = answers.taxYear || 
                   answers["Wat is het belastingjaar van deze administratie?"] || 
                   answers["q1"] || 
                   "2025"
    
    console.log(`Analysis context: legalForm=${legalForm}, taxYear=${taxYear}`)

    // Bereid data voor analyse - beperk aantal transacties voor prompt
    const maxTransactionsForPrompt = 100
    const transactionsForAnalysis = transactions.length > maxTransactionsForPrompt 
      ? transactions.slice(0, maxTransactionsForPrompt)
      : transactions
    
    if (transactions.length > maxTransactionsForPrompt) {
      console.log(`Limiting analysis to first ${maxTransactionsForPrompt} of ${transactions.length} transactions`)
    }
    
    // Helper functie om te bepalen of een transactie een kosten is
    const isExpense = (t: Transaction): boolean => {
      const amount = parseFloat(String(t.bedrag || 0))
      if (isNaN(amount) || amount === 0) return false
      
      // Negatieve bedragen zijn altijd kosten
      if (amount < 0) return true
      
      // Check op kostenrekeningen (typisch 4000-7999 in Nederlandse boekhouding)
      // 4000-4999: Inkoopkosten
      // 5000-5999: Operationele kosten
      // 6000-6999: Personeelskosten
      // 7000-6999: Overige kosten
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rekening = String(t.categorie || t.rekening || (t as any).rekening || '').trim()
      const rekeningNum = parseInt(rekening.replace(/[^0-9]/g, ''))
      if (rekeningNum >= 4000 && rekeningNum < 8000) {
        return true // Kostenrekening
      }
      
      // Check op "Soort" veld voor kostenindicatoren
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const soort = String(t.type || t.soort || (t as any).soort || '').toLowerCase().trim()
      const kostenSoorten = ['inkoop', 'kosten', 'uitgaven', 'expense', 'betaling', 'afschrijving', 'rente', 'huur', 'salaris', 'loon', 'memoriaal']
      if (kostenSoorten.some(k => soort.includes(k))) {
        return true
      }
      
      // Check omschrijving voor kostenindicatoren
      const omschrijving = String(t.omschrijving || '').toLowerCase().trim()
      const kostenKeywords = ['inkoop', 'kosten', 'betaling', 'afschrijving']
      if (kostenKeywords.some(k => omschrijving.includes(k))) {
        return true
      }
      
      // Check tegenrekening - als tegenrekening een kostenrekening is, is het waarschijnlijk een kosten
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tegenrekening = String((t as any).tegenrekening || '').trim()
      const tegenrekeningNum = parseInt(tegenrekening.replace(/[^0-9]/g, ''))
      if (tegenrekeningNum >= 4000 && tegenrekeningNum < 8000) {
        return true
      }
      
      return false
    }
    
    // Helper functie om te bepalen of een transactie een opbrengst is
    const isRevenue = (t: Transaction): boolean => {
      const amount = parseFloat(String(t.bedrag || 0))
      if (isNaN(amount) || amount === 0) return false
      
      // Check eerst of het een kosten is - als dat zo is, is het geen opbrengst
      if (isExpense(t)) {
        return false
      }
      
      // Positieve bedragen zijn meestal opbrengsten
      if (amount > 0) {
        return true
      }
      
      // Check op opbrengstenrekeningen (typisch 8000-8999 in Nederlandse boekhouding)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rekening = String(t.categorie || t.rekening || (t as any).rekening || '').trim()
      const rekeningNum = parseInt(rekening.replace(/[^0-9]/g, ''))
      if (rekeningNum >= 8000 && rekeningNum < 9000) {
        return true // Opbrengstenrekening
      }
      
      // Check op "Soort" veld voor opbrengstindicatoren
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const soort = String(t.type || t.soort || (t as any).soort || '').toLowerCase().trim()
      const opbrengstSoorten = ['omzet', 'verkopen', 'factuur', 'verkoop', 'ontvangst', 'revenue', 'sales']
      if (opbrengstSoorten.some(o => soort.includes(o))) {
        return true
      }
      
      // Check tegenrekening - als tegenrekening een opbrengstenrekening is
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tegenrekening = String((t as any).tegenrekening || '').trim()
      const tegenrekeningNum = parseInt(tegenrekening.replace(/[^0-9]/g, ''))
      if (tegenrekeningNum >= 8000 && tegenrekeningNum < 9000) {
        return true
      }
      
      return false
    }
    
    // Bereid data voor analyse
    const expenseTransactions = transactionsForAnalysis.filter(isExpense)
    const revenueTransactions = transactionsForAnalysis.filter(isRevenue)
    
    console.log(`Expense detection: ${expenseTransactions.length} expenses, ${revenueTransactions.length} revenues out of ${transactionsForAnalysis.length} transactions`)
    
    const analysisData = {
      totalTransactions: transactions.length,
      analyzedTransactions: transactionsForAnalysis.length,
      totalRevenue: revenueTransactions.reduce((sum, t) => {
        const amount = parseFloat(String(t.bedrag || 0))
        return sum + (isNaN(amount) ? 0 : Math.abs(amount))
      }, 0),
      totalExpenses: expenseTransactions.reduce((sum, t) => {
        const amount = parseFloat(String(t.bedrag || 0))
        return sum + (isNaN(amount) ? 0 : Math.abs(amount))
      }, 0),
      expenseCount: expenseTransactions.length,
      revenueCount: revenueTransactions.length,
      transactionsWithoutVAT: transactions.filter(t => {
        const amount = parseFloat(String(t.bedrag || 0))
        return amount > 0 && !t.btw && !t.type?.toLowerCase().includes('btw')
      }).length,
      largeTransactions: transactions.filter(t => 
        Math.abs(parseFloat(String(t.bedrag || 0))) > 10000
      ).length,
      dateRange: getDateRange(transactions),
      legalForm,
      taxYear
    }
    
    console.log(`Analysis data: Revenue=${analysisData.totalRevenue}, Expenses=${analysisData.totalExpenses}, ExpenseCount=${analysisData.expenseCount}, RevenueCount=${analysisData.revenueCount}`)

    const prompt = `Je bent een Nederlandse belastingexpert die een administratie controleert op basis van de belastingregels 2025.

Administratiegegevens:
- Rechtsvorm: ${analysisData.legalForm}
- Belastingjaar: ${analysisData.taxYear}
- Totaal transacties: ${analysisData.totalTransactions}
- Totale omzet: €${analysisData.totalRevenue.toLocaleString('nl-NL')} (${analysisData.revenueCount} opbrengst transacties)
- Totale kosten: €${analysisData.totalExpenses.toLocaleString('nl-NL')} (${analysisData.expenseCount} kosten transacties)
- Transacties zonder BTW info: ${analysisData.transactionsWithoutVAT}
- Grote transacties (>€10.000): ${analysisData.largeTransactions}
- Datum bereik: ${analysisData.dateRange}

Aanvullende informatie:
${Object.entries(answers).map(([q, a]) => `- ${q}: ${a}`).join('\n')}

Voer een grondige controle uit volgens de Nederlandse belastingregels 2025 en geef een JSON response terug met het volgende format:

{
  "findings": [
    {
      "severity": "error" | "warning" | "info",
      "category": "BTW" | "Kosten" | "Periodisering" | "DGA Salaris" | "Zelfstandigenaftrek" | "Documentatie" | "Overig",
      "description": "Korte beschrijving van het probleem",
      "recommendation": "Concrete aanbeveling wat er aangepast moet worden",
      "ruleReference": "Referentie naar relevante belastingwetgeving"
    }
  ],
  "recommendations": {
    "critical": ["Kritieke items die direct aangepast moeten worden"],
    "important": ["Belangrijke aandachtspunten"],
    "suggestions": ["Suggesties voor verbetering"],
    "summary": "Korte samenvatting van de controle resultaten in het Nederlands"
  }
}

Let op:
- Controleer specifiek op BTW administratie fouten
- Controleer kosten aftrekbaarheid volgens 2025 regels
- Controleer periodisering van inkomsten en kosten
- Geef specifieke aandacht aan ${legalForm} specifieke regels
- Wees concreet in aanbevelingen
- Verwijs naar specifieke belastingartikelen waar mogelijk`

    console.log('Sending request to OpenAI...')
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Je bent een ervaren Nederlandse belastingadviseur gespecialiseerd in belastingregels 2025. Je analyseert administraties grondig en geeft concrete, actiegerichte aanbevelingen. Je antwoordt altijd in geldig JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    })

    console.log('Received response from OpenAI')
    
    const content = response.choices[0]?.message?.content || "{}"
    
    if (!content || content.trim() === "{}") {
      throw new Error("OpenAI gaf geen geldige response terug")
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any
    try {
      result = JSON.parse(content)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content.substring(0, 500))
      throw new Error(`OpenAI response kon niet worden geparsed: ${parseError instanceof Error ? parseError.message : 'Onbekende fout'}`)
    }
    
    console.log('Parsed OpenAI response successfully')

    // Valideer en structureer de response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const findings: AuditFinding[] = (result.findings || []).map((f: any) => ({
      severity: f.severity || "info",
      category: f.category || "Overig",
      description: f.description || "",
      recommendation: f.recommendation || "",
      ruleReference: f.ruleReference
    }))

    const recommendations: AuditRecommendations = {
      critical: result.recommendations?.critical || [],
      important: result.recommendations?.important || [],
      suggestions: result.recommendations?.suggestions || [],
      summary: result.recommendations?.summary || "Controle voltooid."
    }

    return { findings, recommendations }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Onbekende fout"
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error("Error analyzing with AI:", errorMessage)
    console.error("Error details:", errorStack)
    console.error("Full error object:", error)
    
    // Probeer een basis analyse uit te voeren zonder AI
    try {
      const basicFindings: AuditFinding[] = []
      
      // Check op basis patronen
      const totalAmount = transactions.reduce((sum, t) => {
        const amount = parseFloat(String(t.bedrag || 0))
        return sum + (isNaN(amount) ? 0 : amount)
      }, 0)
      
      if (totalAmount === 0) {
        basicFindings.push({
          severity: "warning",
          category: "Bedragen",
          description: "Geen bedragen gevonden in de transacties. Controleer of de data correct is ingelezen.",
          recommendation: "Controleer het geüploade bestand en zorg dat bedragen correct zijn opgenomen.",
          ruleReference: undefined
        })
      }
      
      // Check op ontbrekende datums
      const missingDates = transactions.filter(t => !t.datum || t.datum.trim() === "")
      if (missingDates.length > 0) {
        basicFindings.push({
          severity: "warning",
          category: "Datum",
          description: `${missingDates.length} transactie(s) hebben geen datum.`,
          recommendation: "Zorg dat alle transacties een datum hebben voor correcte periodisering.",
          ruleReference: undefined
        })
      }
      
      // Check op ontbrekende omschrijvingen
      const missingDescriptions = transactions.filter(t => !t.omschrijving || t.omschrijving.trim() === "")
      if (missingDescriptions.length > 0) {
        basicFindings.push({
          severity: "info",
          category: "Documentatie",
          description: `${missingDescriptions.length} transactie(s) hebben geen omschrijving.`,
          recommendation: "Voeg omschrijvingen toe voor betere traceerbaarheid.",
          ruleReference: undefined
        })
      }
      
      // Fallback met basis analyse
      return {
        findings: basicFindings.length > 0 ? basicFindings : [{
          severity: "warning",
          category: "Overig",
          description: `Er is een fout opgetreden bij de AI analyse: ${errorMessage}. Basis controle uitgevoerd.`,
          recommendation: "Controleer de administratie handmatig of probeer opnieuw. Als dit probleem aanhoudt, controleer de OpenAI API key.",
          ruleReference: undefined
        }],
        recommendations: {
          critical: basicFindings.filter(f => f.severity === "error").map(f => f.recommendation),
          important: basicFindings.filter(f => f.severity === "warning").map(f => f.recommendation),
          suggestions: [
            "Probeer de analyse opnieuw uit te voeren",
            "Controleer of de OpenAI API key correct is ingesteld",
            "Controleer of je internetverbinding werkt"
          ],
          summary: `Er is een technische fout opgetreden bij de AI analyse (${errorMessage}). Basis controle is uitgevoerd op ${transactions.length} transacties.`
        }
      }
    } catch (fallbackError) {
      console.error("Error in fallback analysis:", fallbackError)
      
      // Laatste fallback
      return {
        findings: [{
          severity: "error",
          category: "Overig",
          description: `Er is een fout opgetreden bij de analyse: ${errorMessage}`,
          recommendation: "Neem contact op met support als dit probleem aanhoudt.",
          ruleReference: undefined
        }],
        recommendations: {
          critical: ["Er is een technische fout opgetreden"],
          important: ["Controleer de administratie handmatig"],
          suggestions: ["Probeer de analyse opnieuw uit te voeren"],
          summary: `Fout: ${errorMessage}`
        }
      }
    }
  }
}

function getDateRange(transactions: Transaction[]): string {
  const dates = transactions
    .map(t => {
      try {
        return new Date(t.datum || '')
      } catch {
        return null
      }
    })
    .filter((d): d is Date => d !== null && !isNaN(d.getTime()))

  if (dates.length === 0) return "Onbekend"

  const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))

  return `${minDate.toLocaleDateString('nl-NL')} - ${maxDate.toLocaleDateString('nl-NL')}`
}

