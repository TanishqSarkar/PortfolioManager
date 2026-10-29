import { Holding, HoldingMetrics, SortKey } from '../types'

export function computeHoldingMetrics(holdings: Holding[]): HoldingMetrics[] {
  const totalCurrentValue = holdings.reduce(
    (sum, h) => sum + h.quantity * h.currentPrice,
    0
  )

  return holdings.map((h) => {
    const investedValue = h.quantity * h.avgPurchasePrice
    const currentValue = h.quantity * h.currentPrice
    const unrealizedPnL = currentValue - investedValue
    const unrealizedReturnPct =
      investedValue > 0 ? (unrealizedPnL / investedValue) * 100 : 0
    const todaysChangeAbs = h.currentPrice - h.previousClose
    const todaysChangePct =
      h.previousClose > 0 ? (todaysChangeAbs / h.previousClose) * 100 : 0
    const todaysPnLContribution = todaysChangeAbs * h.quantity
    const allocationPct =
      totalCurrentValue > 0 ? (currentValue / totalCurrentValue) * 100 : 0

    return {
      ...h,
      investedValue,
      currentValue,
      unrealizedPnL,
      unrealizedReturnPct,
      todaysChangeAbs,
      todaysChangePct,
      todaysPnLContribution,
      allocationPct,
    }
  })
}

export function portfolioTotals(metrics: HoldingMetrics[]) {
  const totalInvested = metrics.reduce((s, m) => s + m.investedValue, 0)
  const totalCurrent = metrics.reduce((s, m) => s + m.currentValue, 0)
  const totalPnL = totalCurrent - totalInvested
  const totalReturnPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0
  const todaysChange = metrics.reduce((s, m) => s + m.todaysPnLContribution, 0)
  const previousTotalValue = totalCurrent - todaysChange
  const todaysChangePct =
    previousTotalValue > 0 ? (todaysChange / previousTotalValue) * 100 : 0

  return {
    totalInvested,
    totalCurrent,
    totalPnL,
    totalReturnPct,
    todaysChange,
    todaysChangePct,
  }
}

export function sortHoldings(
  metrics: HoldingMetrics[],
  sortKey: SortKey
): HoldingMetrics[] {
  const sorted = [...metrics]
  switch (sortKey) {
    case 'name-asc':
      return sorted.sort((a, b) => a.companyName.localeCompare(b.companyName))
    case 'name-desc':
      return sorted.sort((a, b) => b.companyName.localeCompare(a.companyName))
    case 'price-high':
      return sorted.sort((a, b) => b.currentPrice - a.currentPrice)
    case 'price-low':
      return sorted.sort((a, b) => a.currentPrice - b.currentPrice)
    case 'profit-high':
      return sorted.sort((a, b) => b.unrealizedPnL - a.unrealizedPnL)
    case 'profit-low':
      return sorted.sort((a, b) => a.unrealizedPnL - b.unrealizedPnL)
    case 'profitPct-high':
      return sorted.sort((a, b) => b.unrealizedReturnPct - a.unrealizedReturnPct)
    case 'profitPct-low':
      return sorted.sort((a, b) => a.unrealizedReturnPct - b.unrealizedReturnPct)
    case 'invested-high':
      return sorted.sort((a, b) => b.investedValue - a.investedValue)
    case 'invested-low':
      return sorted.sort((a, b) => a.investedValue - b.investedValue)
    case 'current-high':
      return sorted.sort((a, b) => b.currentValue - a.currentValue)
    case 'current-low':
      return sorted.sort((a, b) => a.currentValue - b.currentValue)
    case 'qty-high':
      return sorted.sort((a, b) => b.quantity - a.quantity)
    case 'qty-low':
      return sorted.sort((a, b) => a.quantity - b.quantity)
    case 'volume-high':
      return sorted.sort((a, b) => b.volume - a.volume)
    case 'volume-low':
      return sorted.sort((a, b) => a.volume - b.volume)
    case 'todayChange-high':
      return sorted.sort((a, b) => b.todaysChangePct - a.todaysChangePct)
    case 'todayChange-low':
      return sorted.sort((a, b) => a.todaysChangePct - b.todaysChangePct)
    case 'allocation-high':
      return sorted.sort((a, b) => b.allocationPct - a.allocationPct)
    case 'allocation-low':
      return sorted.sort((a, b) => a.allocationPct - b.allocationPct)
    default:
      return sorted
  }
}

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name-asc', label: 'Company Name (A–Z)' },
  { value: 'name-desc', label: 'Company Name (Z–A)' },
  { value: 'price-high', label: 'Price (Highest)' },
  { value: 'price-low', label: 'Price (Lowest)' },
  { value: 'profit-high', label: 'Total Profit ₹ (Highest)' },
  { value: 'profit-low', label: 'Total Profit ₹ (Lowest)' },
  { value: 'profitPct-high', label: 'Profit % (Highest)' },
  { value: 'profitPct-low', label: 'Profit % (Lowest)' },
  { value: 'invested-high', label: 'Invested Value (Highest)' },
  { value: 'invested-low', label: 'Invested Value (Lowest)' },
  { value: 'current-high', label: 'Current Value (Highest)' },
  { value: 'current-low', label: 'Current Value (Lowest)' },
  { value: 'qty-high', label: 'Quantity (Highest)' },
  { value: 'qty-low', label: 'Quantity (Lowest)' },
  { value: 'volume-high', label: 'Volume (Highest)' },
  { value: 'volume-low', label: 'Volume (Lowest)' },
  { value: 'todayChange-high', label: "Today's Change (Highest)" },
  { value: 'todayChange-low', label: "Today's Change (Lowest)" },
  { value: 'allocation-high', label: 'Allocation % (Highest)' },
  { value: 'allocation-low', label: 'Allocation % (Lowest)' },
]
