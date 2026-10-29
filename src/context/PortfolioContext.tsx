import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Portfolio, Holding, NewHoldingInput } from '../types'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'
import { getQuote, refreshAllQuotes } from '../services/marketDataService'

interface PortfolioRow {
  id: string
  user_id: string
  name: string
  created_at: string
}

interface HoldingRow {
  id: string
  portfolio_id: string
  ticker_symbol: string
  company_name: string
  quantity: number
  average_purchase_price: number
  purchase_date: string | null
}

interface PortfolioContextValue {
  portfolios: Portfolio[]
  isLoading: boolean
  createPortfolio: (name: string) => Promise<void>
  renamePortfolio: (id: string, name: string) => Promise<void>
  deletePortfolio: (id: string) => Promise<void>
  addHolding: (holding: NewHoldingInput) => Promise<void>
  updateHolding: (id: string, updates: Partial<NewHoldingInput>) => Promise<void>
  removeHolding: (id: string) => Promise<void>
  holdingsForPortfolio: (portfolioId: string) => Holding[]
  refreshPrices: () => void
  lastUpdated: Date
  isRefreshing: boolean
}

const PortfolioContext = createContext<PortfolioContextValue | undefined>(undefined)

function enrich(row: HoldingRow): Holding {
  const quote = getQuote(row.ticker_symbol, row.company_name)
  return {
    id: row.id,
    portfolioId: row.portfolio_id,
    ticker: row.ticker_symbol,
    companyName: row.company_name,
    sector: quote.sector,
    quantity: Number(row.quantity),
    avgPurchasePrice: Number(row.average_purchase_price),
    purchaseDate: row.purchase_date || '',
    currentPrice: quote.currentPrice,
    previousClose: quote.previousClose,
    volume: quote.volume,
  }
}

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [portfolioRows, setPortfolioRows] = useState<PortfolioRow[]>([])
  const [holdingRows, setHoldingRows] = useState<HoldingRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)

  const loadData = useCallback(async () => {
    if (!user) {
      setPortfolioRows([])
      setHoldingRows([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)

    const { data: portfolios, error: pErr } = await supabase
      .from('portfolios')
      .select('*')
      .order('created_at', { ascending: true })
    if (pErr) console.error('Failed to load portfolios:', pErr.message)
    setPortfolioRows(portfolios ?? [])

    const { data: holdings, error: hErr } = await supabase.from('holdings').select('*')
    if (hErr) console.error('Failed to load holdings:', hErr.message)
    setHoldingRows(holdings ?? [])

    setIsLoading(false)
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  const createPortfolio = async (name: string) => {
    if (!user) return
    const { data, error } = await supabase
      .from('portfolios')
      .insert({ user_id: user.id, name })
      .select()
      .single()
    if (error) {
      console.error('Failed to create portfolio:', error.message)
      return
    }
    setPortfolioRows((prev) => [...prev, data as PortfolioRow])
  }

  const renamePortfolio = async (id: string, name: string) => {
    const { error } = await supabase.from('portfolios').update({ name }).eq('id', id)
    if (error) {
      console.error('Failed to rename portfolio:', error.message)
      return
    }
    setPortfolioRows((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)))
  }

  const deletePortfolio = async (id: string) => {
    const { error } = await supabase.from('portfolios').delete().eq('id', id)
    if (error) {
      console.error('Failed to delete portfolio:', error.message)
      return
    }
    setPortfolioRows((prev) => prev.filter((p) => p.id !== id))
    setHoldingRows((prev) => prev.filter((h) => h.portfolio_id !== id))
  }

  const addHolding = async (holding: NewHoldingInput) => {
    // Merge into an existing holding of the same ticker in the same
    // portfolio instead of creating a duplicate row.
    const existing = holdingRows.find(
      (h) => h.portfolio_id === holding.portfolioId && h.ticker_symbol === holding.ticker
    )
    if (existing) {
      const totalQty = Number(existing.quantity) + holding.quantity
      const blendedAvg =
        (Number(existing.quantity) * Number(existing.average_purchase_price) +
          holding.quantity * holding.avgPurchasePrice) /
        totalQty
      const { error } = await supabase
        .from('holdings')
        .update({ quantity: totalQty, average_purchase_price: blendedAvg })
        .eq('id', existing.id)
      if (error) {
        console.error('Failed to update holding:', error.message)
        return
      }
      setHoldingRows((prev) =>
        prev.map((h) =>
          h.id === existing.id
            ? { ...h, quantity: totalQty, average_purchase_price: blendedAvg }
            : h
        )
      )
      return
    }

    const { data, error } = await supabase
      .from('holdings')
      .insert({
        portfolio_id: holding.portfolioId,
        ticker_symbol: holding.ticker,
        company_name: holding.companyName,
        quantity: holding.quantity,
        average_purchase_price: holding.avgPurchasePrice,
        purchase_date: holding.purchaseDate || null,
      })
      .select()
      .single()
    if (error) {
      console.error('Failed to add holding:', error.message)
      return
    }
    setHoldingRows((prev) => [...prev, data as HoldingRow])
  }

  const updateHolding = async (id: string, updates: Partial<NewHoldingInput>) => {
    const payload: Record<string, unknown> = {}
    if (updates.quantity !== undefined) payload.quantity = updates.quantity
    if (updates.avgPurchasePrice !== undefined) payload.average_purchase_price = updates.avgPurchasePrice
    if (updates.purchaseDate !== undefined) payload.purchase_date = updates.purchaseDate || null
    if (updates.companyName !== undefined) payload.company_name = updates.companyName

    const { error } = await supabase.from('holdings').update(payload).eq('id', id)
    if (error) {
      console.error('Failed to update holding:', error.message)
      return
    }
    setHoldingRows((prev) => prev.map((h) => (h.id === id ? { ...h, ...payload } : h)))
  }

  const removeHolding = async (id: string) => {
    const { error } = await supabase.from('holdings').delete().eq('id', id)
    if (error) {
      console.error('Failed to remove holding:', error.message)
      return
    }
    setHoldingRows((prev) => prev.filter((h) => h.id !== id))
  }

  // refreshTick is a dependency only so holdingsForPortfolio's closure is
  // considered "fresh" by consumers after a price refresh mutates the
  // market data service's internal store (which lives outside React state).
  const holdingsForPortfolio = (portfolioId: string) => {
    void refreshTick
    return holdingRows.filter((h) => h.portfolio_id === portfolioId).map(enrich)
  }

  const refreshPrices = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      refreshAllQuotes()
      setRefreshTick((t) => t + 1)
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }, 600)
  }

  const portfolios: Portfolio[] = portfolioRows.map((p) => ({
    id: p.id,
    userId: p.user_id,
    name: p.name,
    createdAt: p.created_at,
  }))

  return (
    <PortfolioContext.Provider
      value={{
        portfolios,
        isLoading,
        createPortfolio,
        renamePortfolio,
        deletePortfolio,
        addHolding,
        updateHolding,
        removeHolding,
        holdingsForPortfolio,
        refreshPrices,
        lastUpdated,
        isRefreshing,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolios() {
  const ctx = useContext(PortfolioContext)
  if (!ctx) throw new Error('usePortfolios must be used within PortfolioProvider')
  return ctx
}
