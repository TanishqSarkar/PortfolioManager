// DEMO MODE MARKET DATA SERVICE
// ─────────────────────────────────────────────────────────────────────────
// This module simulates a market data provider with a static catalog of
// NSE-listed companies and client-side price jitter on "refresh". It is
// intentionally kept separate from the database: per the project spec,
// market prices are NEVER stored as permanent holding attributes — only
// portfolio_id, ticker, company name, quantity, average purchase price and
// purchase date live in Supabase (see supabase/schema.sql).
//
// In Phase 5 this file's exported functions (getQuote, refreshAllQuotes,
// searchCatalog) will be swapped out for calls to a Supabase Edge Function
// that talks to a licensed NSE-compatible market data provider, keeping the
// provider's API key safely server-side. Nothing outside this file needs to
// change for that swap — every other module only calls these functions.

export interface Quote {
  companyName: string
  sector: string
  currentPrice: number
  previousClose: number
  volume: number
}

interface CatalogEntry {
  companyName: string
  sector: string
  basePrice: number
}

const CATALOG: Record<string, CatalogEntry> = {
  RELIANCE: { companyName: 'Reliance Industries Ltd', sector: 'Energy', basePrice: 2610.4 },
  TCS: { companyName: 'Tata Consultancy Services Ltd', sector: 'IT', basePrice: 3890.75 },
  HDFCBANK: { companyName: 'HDFC Bank Ltd', sector: 'Banking', basePrice: 1689.3 },
  INFY: { companyName: 'Infosys Ltd', sector: 'IT', basePrice: 1388.2 },
  ICICIBANK: { companyName: 'ICICI Bank Ltd', sector: 'Banking', basePrice: 1123.6 },
  BAJFINANCE: { companyName: 'Bajaj Finance Ltd', sector: 'Financial Services', basePrice: 6512.9 },
  ASIANPAINT: { companyName: 'Asian Paints Ltd', sector: 'Consumer Goods', basePrice: 2814.5 },
  ITC: { companyName: 'ITC Ltd', sector: 'FMCG', basePrice: 468.75 },
  LT: { companyName: 'Larsen & Toubro Ltd', sector: 'Infrastructure', basePrice: 3458.9 },
  SUNPHARMA: { companyName: 'Sun Pharmaceutical Industries Ltd', sector: 'Pharma', basePrice: 1245.3 },
  MARUTI: { companyName: 'Maruti Suzuki India Ltd', sector: 'Automobile', basePrice: 11420.6 },
  WIPRO: { companyName: 'Wipro Ltd', sector: 'IT', basePrice: 421.8 },
  TATAMOTORS: { companyName: 'Tata Motors Ltd', sector: 'Automobile', basePrice: 1002.4 },
  ADANIENT: { companyName: 'Adani Enterprises Ltd', sector: 'Conglomerate', basePrice: 2612.0 },
  ZOMATO: { companyName: 'Eternal Ltd (Zomato)', sector: 'Internet', basePrice: 268.9 },
  IRFC: { companyName: 'Indian Railway Finance Corp Ltd', sector: 'Financial Services', basePrice: 128.45 },
  YESBANK: { companyName: 'Yes Bank Ltd', sector: 'Banking', basePrice: 21.85 },
  COALINDIA: { companyName: 'Coal India Ltd', sector: 'Mining', basePrice: 452.6 },
  POWERGRID: { companyName: 'Power Grid Corp of India Ltd', sector: 'Utilities', basePrice: 298.75 },
  ONGC: { companyName: 'Oil & Natural Gas Corp Ltd', sector: 'Energy', basePrice: 249.3 },
  HINDUNILVR: { companyName: 'Hindustan Unilever Ltd', sector: 'FMCG', basePrice: 2398.6 },
}

const liveStore = new Map<string, Quote>(
  Object.entries(CATALOG).map(([ticker, c]) => [
    ticker,
    {
      companyName: c.companyName,
      sector: c.sector,
      currentPrice: c.basePrice,
      previousClose: c.basePrice,
      volume: 1_000_000,
    },
  ])
)

/**
 * Returns a quote for a ticker. Unknown tickers (e.g. a user-typed symbol
 * not in the demo catalog) get a deterministic placeholder price derived
 * from the ticker's characters, so the same unknown ticker always shows the
 * same demo price within a session.
 */
export function getQuote(ticker: string, fallbackCompanyName?: string): Quote {
  const key = ticker.toUpperCase()
  if (!liveStore.has(key)) {
    const seed = [...key].reduce((sum, c) => sum + c.charCodeAt(0), 0)
    const price = Number((100 + (seed % 900) + (seed % 37) / 100).toFixed(2))
    liveStore.set(key, {
      companyName: fallbackCompanyName || key,
      sector: 'Other',
      currentPrice: price,
      previousClose: price,
      volume: 100_000 + (seed % 50) * 10_000,
    })
  }
  return liveStore.get(key) as Quote
}

/** Simulates a price tick for every known quote (used by the Refresh button). */
export function refreshAllQuotes(): void {
  liveStore.forEach((q, key) => {
    const jitter = (Math.random() - 0.5) * 0.01 // +/- 0.5%
    const newPrice = Math.max(0.05, q.currentPrice * (1 + jitter))
    liveStore.set(key, {
      ...q,
      previousClose: q.currentPrice,
      currentPrice: Number(newPrice.toFixed(2)),
    })
  })
}

/** Searches the demo catalog by ticker or company name, for the Add Stock modal. */
export function searchCatalog(query: string, limit = 8) {
  const q = query.toLowerCase()
  return Object.entries(CATALOG)
    .filter(
      ([ticker, c]) =>
        ticker.toLowerCase().includes(q) || c.companyName.toLowerCase().includes(q)
    )
    .slice(0, limit)
    .map(([ticker, c]) => ({
      ticker,
      companyName: c.companyName,
      sector: c.sector,
      currentPrice: liveStore.get(ticker)?.currentPrice ?? c.basePrice,
    }))
}
