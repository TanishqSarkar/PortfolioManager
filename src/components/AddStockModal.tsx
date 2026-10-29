import { useState, useMemo } from 'react'
import { X, Search } from 'lucide-react'
import { Holding, NewHoldingInput } from '../types'
import { searchCatalog } from '../services/marketDataService'
import { formatINR } from '../utils/format'

interface Props {
  portfolioId: string
  editingHolding: Holding | null
  onClose: () => void
  onSave: (holding: NewHoldingInput, editId?: string) => void
}

export default function AddStockModal({ portfolioId, editingHolding, onClose, onSave }: Props) {
  const isEdit = !!editingHolding
  const [query, setQuery] = useState(editingHolding?.ticker ?? '')
  const [selected, setSelected] = useState(
    editingHolding
      ? { ticker: editingHolding.ticker, companyName: editingHolding.companyName }
      : null
  )
  const [quantity, setQuantity] = useState(editingHolding ? String(editingHolding.quantity) : '')
  const [avgPrice, setAvgPrice] = useState(
    editingHolding ? String(editingHolding.avgPurchasePrice) : ''
  )
  const [purchaseDate, setPurchaseDate] = useState(editingHolding?.purchaseDate ?? '')
  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState('')

  const matches = useMemo(() => {
    if (!query || selected) return []
    return searchCatalog(query)
  }, [query, selected])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const qty = parseFloat(quantity)
    const price = parseFloat(avgPrice)

    if (!isEdit && !selected) {
      setError('Please select a stock from the search results.')
      return
    }
    if (!quantity || isNaN(qty) || qty <= 0) {
      setError('Enter a valid quantity greater than zero.')
      return
    }
    if (!avgPrice || isNaN(price) || price <= 0) {
      setError('Enter a valid average purchase price greater than zero.')
      return
    }

    const tickerInfo = selected ??
      (editingHolding
        ? { ticker: editingHolding.ticker, companyName: editingHolding.companyName }
        : null)
    if (!tickerInfo) {
      setError('Please select a stock.')
      return
    }

    onSave(
      {
        portfolioId,
        ticker: tickerInfo.ticker,
        companyName: tickerInfo.companyName,
        quantity: qty,
        avgPurchasePrice: price,
        purchaseDate: purchaseDate || new Date().toISOString().slice(0, 10),
      },
      editingHolding?.id
    )
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-base-700 bg-navy-900 p-6 shadow-card">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-100">
            {isEdit ? `Edit ${editingHolding!.ticker}` : 'Add Stock'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && (
            <div className="relative">
              <label className="mb-1.5 block text-xs font-medium text-gray-400">
                NSE Ticker / Company Name
              </label>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelected(null)
                    setShowDropdown(true)
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="e.g. RELIANCE or Reliance Industries"
                  className="w-full rounded-lg border border-base-600 bg-base-800 py-2.5 pl-9 pr-3 text-sm text-gray-100 outline-none focus:border-accent"
                />
              </div>
              {showDropdown && matches.length > 0 && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-base-600 bg-base-800 shadow-xl">
                  {matches.map((m) => (
                    <button
                      type="button"
                      key={m.ticker}
                      onClick={() => {
                        setSelected({ ticker: m.ticker, companyName: m.companyName })
                        setQuery(`${m.ticker} — ${m.companyName}`)
                        setShowDropdown(false)
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-base-700"
                    >
                      <span>
                        <span className="font-semibold text-gray-100">{m.ticker}</span>{' '}
                        <span className="text-gray-500">{m.companyName}</span>
                      </span>
                      <span className="text-gray-400">{formatINR(m.currentPrice, 2)}</span>
                    </button>
                  ))}
                </div>
              )}
              {!isEdit && query && !selected && matches.length === 0 && (
                <p className="mt-1.5 text-xs text-gray-600">
                  No matches in the demo catalog (~21 NSE stocks for now). More tickers will be
                  searchable once real market data is connected in a later phase.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">
                Quantity {isEdit ? '' : 'Purchased'}
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2.5 text-sm text-gray-100 outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">
                Avg. Purchase Price
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={avgPrice}
                onChange={(e) => setAvgPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2.5 text-sm text-gray-100 outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">
              Purchase Date (optional)
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2.5 text-sm text-gray-100 outline-none focus:border-accent [color-scheme:dark]"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-loss/30 bg-loss-bg px-3 py-2 text-xs text-loss">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-base-600 px-4 py-2 text-sm text-gray-300 hover:bg-base-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dim"
            >
              {isEdit ? 'Save Changes' : 'Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
