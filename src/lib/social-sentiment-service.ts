/**
 * Social Sentiment Service voor Deep Research
 * Haalt sentiment en discussies op van sociale media platforms:
 * - Reddit API (gratis, rate limited)
 * - Analyseert sentiment van posts en comments
 */

interface SocialPost {
  title: string
  content: string
  url: string
  author: string
  publishedAt: string
  score: number
  comments: number
  subreddit: string
  sentiment?: 'positive' | 'negative' | 'neutral'
}

interface SentimentAnalysis {
  overallSentiment: 'positive' | 'negative' | 'neutral'
  sentimentScore: number // -1 tot 1
  totalPosts: number
  positivePosts: number
  negativePosts: number
  neutralPosts: number
  topPosts: SocialPost[]
}

// Reddit subreddits voor financiële discussies
const FINANCIAL_SUBREDDITS = [
  'investing',
  'stocks',
  'SecurityAnalysis',
  'ValueInvesting',
  'StockMarket',
  'wallstreetbets', // Voor sentiment, niet voor advies
  'dividends',
  'options',
  'Stock_Picks'
]

/**
 * Zoek Reddit posts over een specifiek aandeel
 * Reddit API is gratis maar vereist User-Agent header
 */
async function searchRedditPosts(
  symbol: string,
  companyName?: string,
  limit: number = 20
): Promise<SocialPost[]> {
  const searchQuery = companyName 
    ? `${companyName} OR ${symbol}`
    : symbol

  const posts: SocialPost[] = []

  try {
    // Zoek in meerdere subreddits
    const subredditPromises = FINANCIAL_SUBREDDITS.slice(0, 5).map(async (subreddit) => {
      try {
        // Reddit search API (gratis, geen auth nodig voor read-only)
        const searchUrl = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(searchQuery)}&sort=relevance&limit=5&t=month`
        
        const response = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'TaxWealthHub/1.0 (contact@taxwealthhub.com)',
            'Accept': 'application/json'
          },
          cache: 'no-store'
        })

        if (!response.ok) {
          return []
        }

        const data = await response.json()
        const children = data.data?.children || []

        return children.map((child: any) => {
          const post = child.data
          return {
            title: post.title || '',
            content: post.selftext || '',
            url: `https://reddit.com${post.permalink}`,
            author: post.author || 'unknown',
            publishedAt: new Date(post.created_utc * 1000).toISOString(),
            score: post.score || 0,
            comments: post.num_comments || 0,
            subreddit: post.subreddit || subreddit
          }
        })
      } catch (error) {
        console.warn(`[SocialSentiment] Error searching r/${subreddit}:`, error)
        return []
      }
    })

    const results = await Promise.allSettled(subredditPromises)
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        posts.push(...result.value)
      }
    })

    // Sorteer op score en datum, verwijder duplicaten
    const uniquePosts = Array.from(
      new Map(posts.map(post => [post.url, post])).values()
    )
      .sort((a, b) => {
        // Sorteer op score eerst, dan op datum
        if (b.score !== a.score) {
          return b.score - a.score
        }
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      })
      .slice(0, limit)

    return uniquePosts
  } catch (error) {
    console.error("[SocialSentiment] Error searching Reddit:", error)
    return []
  }
}

/**
 * Analyseer sentiment van een tekst (simpele keyword-based analyse)
 * In productie zou je een ML model of API gebruiken
 */
function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const lowerText = text.toLowerCase()
  
  // Positieve keywords
  const positiveKeywords = [
    'buy', 'bullish', 'growth', 'profit', 'gain', 'rise', 'up', 'strong',
    'good', 'great', 'excellent', 'outperform', 'beat', 'surprise',
    'opportunity', 'potential', 'promising', 'optimistic', 'positive',
    'koop', 'groei', 'winst', 'stijging', 'sterk', 'goed', 'uitstekend'
  ]
  
  // Negatieve keywords
  const negativeKeywords = [
    'sell', 'bearish', 'decline', 'loss', 'drop', 'down', 'weak',
    'bad', 'poor', 'underperform', 'miss', 'disappoint', 'risk',
    'concern', 'worry', 'negative', 'pessimistic', 'crash', 'fall',
    'verkoop', 'daling', 'verlies', 'zwak', 'slecht', 'risico', 'zorg'
  ]

  const positiveCount = positiveKeywords.filter(keyword => lowerText.includes(keyword)).length
  const negativeCount = negativeKeywords.filter(keyword => lowerText.includes(keyword)).length

  if (positiveCount > negativeCount) {
    return 'positive'
  } else if (negativeCount > positiveCount) {
    return 'negative'
  } else {
    return 'neutral'
  }
}

/**
 * Bereken sentiment score (-1 tot 1)
 */
function calculateSentimentScore(posts: SocialPost[]): number {
  if (posts.length === 0) return 0

  let totalScore = 0
  posts.forEach(post => {
    if (post.sentiment === 'positive') {
      totalScore += 1
    } else if (post.sentiment === 'negative') {
      totalScore -= 1
    }
    // neutral adds 0
  })

  return totalScore / posts.length
}

/**
 * Haal sentiment analyse op voor een aandeel
 */
export async function fetchSocialSentiment(
  symbol: string,
  companyName?: string,
  limit: number = 30
): Promise<SentimentAnalysis> {
  console.log(`[SocialSentiment] Fetching sentiment for ${symbol}...`)

  const posts = await searchRedditPosts(symbol, companyName, limit)

  // Analyseer sentiment voor elke post
  const postsWithSentiment = posts.map(post => ({
    ...post,
    sentiment: analyzeSentiment(`${post.title} ${post.content}`)
  }))

  // Tel sentiment types
  const positivePosts = postsWithSentiment.filter(p => p.sentiment === 'positive').length
  const negativePosts = postsWithSentiment.filter(p => p.sentiment === 'negative').length
  const neutralPosts = postsWithSentiment.filter(p => p.sentiment === 'neutral').length

  // Bereken overall sentiment
  const sentimentScore = calculateSentimentScore(postsWithSentiment)
  let overallSentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
  
  if (sentimentScore > 0.1) {
    overallSentiment = 'positive'
  } else if (sentimentScore < -0.1) {
    overallSentiment = 'negative'
  }

  // Top posts (hoogste score)
  const topPosts = postsWithSentiment
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  console.log(`[SocialSentiment] ✅ Found ${posts.length} posts, sentiment: ${overallSentiment} (${sentimentScore.toFixed(2)})`)

  return {
    overallSentiment,
    sentimentScore,
    totalPosts: posts.length,
    positivePosts,
    negativePosts,
    neutralPosts,
    topPosts
  }
}

/**
 * Format sentiment data voor gebruik in AI prompts
 */
export function formatSocialSentiment(sentiment: SentimentAnalysis): string {
  let formatted = `\n=== SOCIAL MEDIA SENTIMENT ===\n`
  
  formatted += `\nOverall Sentiment: ${sentiment.overallSentiment.toUpperCase()}\n`
  formatted += `Sentiment Score: ${sentiment.sentimentScore.toFixed(2)} (range: -1 tot 1)\n`
  formatted += `\nSentiment Breakdown:\n`
  formatted += `- Positief: ${sentiment.positivePosts} posts\n`
  formatted += `- Negatief: ${sentiment.negativePosts} posts\n`
  formatted += `- Neutraal: ${sentiment.neutralPosts} posts\n`
  formatted += `- Totaal: ${sentiment.totalPosts} posts\n`

  if (sentiment.topPosts.length > 0) {
    formatted += `\n--- TOP DISCUSSIES (Reddit) ---\n`
    sentiment.topPosts.slice(0, 8).forEach((post, idx) => {
      formatted += `${idx + 1}. ${post.title}\n`
      if (post.content && post.content.length > 0) {
        const preview = post.content.substring(0, 200)
        formatted += `   ${preview}${post.content.length > 200 ? '...' : ''}\n`
      }
      formatted += `   r/${post.subreddit} | Score: ${post.score} | Comments: ${post.comments} | Sentiment: ${post.sentiment}\n`
      formatted += `   ${post.url}\n\n`
    })
  }

  return formatted
}

/**
 * Haal recente discussies op over een sector
 */
export async function fetchSectorDiscussions(
  sector: string,
  limit: number = 15
): Promise<SocialPost[]> {
  const posts: SocialPost[] = []

  try {
    // Zoek in algemene investing subreddits
    const searchUrl = `https://www.reddit.com/r/investing/search.json?q=${encodeURIComponent(sector)}&sort=relevance&limit=${limit}&t=month`
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'TaxWealthHub/1.0 (contact@taxwealthhub.com)',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    })

    if (response.ok) {
      const data = await response.json()
      const children = data.data?.children || []

      children.forEach((child: any) => {
        const post = child.data
        posts.push({
          title: post.title || '',
          content: post.selftext || '',
          url: `https://reddit.com${post.permalink}`,
          author: post.author || 'unknown',
          publishedAt: new Date(post.created_utc * 1000).toISOString(),
          score: post.score || 0,
          comments: post.num_comments || 0,
          subreddit: post.subreddit || 'investing',
          sentiment: analyzeSentiment(`${post.title} ${post.selftext}`)
        })
      })
    }
  } catch (error) {
    console.error("[SocialSentiment] Error fetching sector discussions:", error)
  }

  return posts.sort((a, b) => b.score - a.score).slice(0, limit)
}

