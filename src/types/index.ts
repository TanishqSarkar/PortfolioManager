export interface User {
  id: string
  email: string
  name: string
}

export interface Holding {
  id: string
  portfolioId: string
  ticker: string
  companyName: string
  sector: string
  quantity: number
  avgPurchasePrice: number
  purchaseDate: string
  currentPrice: number
  previousClose: number
  volume: number
}

export interface Portfolio {
  id: string
  userId: string
  name: string
  createdAt: string
}

// What the Add/Edit Stock modal collects and hands to PortfolioContext.
// Only these fields are persisted to the `holdings` table in Supabase —
// price/sector/volume are looked up live from the market data service.
export interface NewHoldingInput {
  portfolioId: string
  ticker: string
  companyName: string
  quantity: number
  avgPurchasePrice: number
  purchaseDate: string
}

export interface HoldingMetrics extends Holding {
  investedValue: number
  currentValue: number
  unrealizedPnL: number
  unrealizedReturnPct: number
  todaysChangeAbs: number
  todaysChangePct: number
  todaysPnLContribution: number
  allocationPct: number
}

export type SortKey =
  | 'name-asc'
  | 'name-desc'
  | 'price-high'
  | 'price-low'
  | 'profit-high'
  | 'profit-low'
  | 'profitPct-high'
  | 'profitPct-low'
  | 'invested-high'
  | 'invested-low'
  | 'current-high'
  | 'current-low'
  | 'qty-high'
  | 'qty-low'
  | 'volume-high'
  | 'volume-low'
  | 'todayChange-high'
  | 'todayChange-low'
  | 'allocation-high'
  | 'allocation-low'
