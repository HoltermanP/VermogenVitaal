/**
 * Test script voor de nieuwe enhanced services
 * Test alle gratis services zonder API keys waar mogelijk
 */

import { fetchEnhancedFinancialData, formatEnhancedFinancialData } from '../src/lib/enhanced-financial-data'
import { fetchEnhancedStockNews, formatEnhancedNews } from '../src/lib/enhanced-news-service'
import { fetchSocialSentiment, formatSocialSentiment } from '../src/lib/social-sentiment-service'

async function testEnhancedServices() {
  console.log('🧪 Testing Enhanced Services...\n')
  
  const testSymbol = 'AAPL' // Apple als test
  const testCompanyName = 'Apple Inc.'
  
  console.log(`Testing with symbol: ${testSymbol} (${testCompanyName})\n`)
  
  // Test 1: Enhanced Financial Data
  console.log('1️⃣ Testing Enhanced Financial Data Service...')
  try {
    const financialData = await fetchEnhancedFinancialData(testSymbol, testCompanyName)
    console.log('✅ Enhanced Financial Data fetched successfully')
    console.log(`   - Company: ${financialData.companyName}`)
    console.log(`   - Sector: ${financialData.sector || 'N/A'}`)
    console.log(`   - FMP Data: ${financialData.fmpData ? '✅' : '❌ (no API key)'}`)
    console.log(`   - SEC Data: ${financialData.secData ? '✅' : '❌'}`)
    console.log(`   - Alpha Vantage Data: ${financialData.alphaVantageData ? '✅' : '❌ (no API key or limit)'}`)
    
    if (financialData.fmpData || financialData.secData || financialData.alphaVantageData) {
      const formatted = formatEnhancedFinancialData(financialData)
      console.log(`   Formatted length: ${formatted.length} characters\n`)
    }
  } catch (error) {
    console.error('❌ Error testing Enhanced Financial Data:', error)
  }
  
  console.log('\n')
  
  // Test 2: Enhanced News Service
  console.log('2️⃣ Testing Enhanced News Service...')
  try {
    const news = await fetchEnhancedStockNews(testSymbol, testCompanyName, 'Technology', 'Consumer Electronics', 10)
    console.log('✅ Enhanced News fetched successfully')
    console.log(`   - Company News: ${news.companyNews.length} articles`)
    console.log(`   - Sector News: ${news.sectorNews.length} articles`)
    console.log(`   - Market News: ${news.marketNews.length} articles`)
    console.log(`   - Analyst News: ${news.analystNews.length} articles`)
    
    if (news.companyNews.length > 0 || news.marketNews.length > 0) {
      const formatted = formatEnhancedNews(news)
      console.log(`   Formatted length: ${formatted.length} characters\n`)
    }
  } catch (error) {
    console.error('❌ Error testing Enhanced News:', error)
  }
  
  console.log('\n')
  
  // Test 3: Social Sentiment Service
  console.log('3️⃣ Testing Social Sentiment Service...')
  try {
    const sentiment = await fetchSocialSentiment(testSymbol, testCompanyName, 15)
    console.log('✅ Social Sentiment fetched successfully')
    console.log(`   - Overall Sentiment: ${sentiment.overallSentiment}`)
    console.log(`   - Sentiment Score: ${sentiment.sentimentScore.toFixed(2)}`)
    console.log(`   - Total Posts: ${sentiment.totalPosts}`)
    console.log(`   - Positive: ${sentiment.positivePosts}, Negative: ${sentiment.negativePosts}, Neutral: ${sentiment.neutralPosts}`)
    console.log(`   - Top Posts: ${sentiment.topPosts.length}`)
    
    if (sentiment.totalPosts > 0) {
      const formatted = formatSocialSentiment(sentiment)
      console.log(`   Formatted length: ${formatted.length} characters\n`)
    }
  } catch (error) {
    console.error('❌ Error testing Social Sentiment:', error)
  }
  
  console.log('\n✅ All tests completed!')
}

// Run tests
testEnhancedServices().catch(console.error)

