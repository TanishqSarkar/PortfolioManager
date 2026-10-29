import { useMemo, useState } from 'react'
import { Search, ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { HoldingMetrics, SortKey } from '../types'
import { sortHoldings, SORT_OPTIONS } from '../utils/calculations'
import { formatINR, formatSignedINR, formatPct, formatCompactVolume, formatNumber } from '../utils/format'

interface Props {
  metrics: HoldingMetrics[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onEdit: (holding: HoldingMetrics) => void
  onRemove: (holding: HoldingMetrics) => void
}

export default function HoldingsList({ metrics, selectedId, onSelect, onEdit, onRemove }: Props) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('allocation-high')
  const [sortOpen, setSortOpen] = useState(false)
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = q
      ? metrics.filter(
          (m) =>
            m.companyName.toLowerCase().includes(q) || m.ticker.toLowerCase().includes(q)
        )
      : metrics
    return sortHoldings(base, sortKey)
  }, [metrics, search, sortKey])

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortKey)?.label

  return (
    <div className="flex h-full flex-col rounded-2xl border border-base-700 bg-navy-900 shadow-card">
      <div className="flex flex-col gap-3 border-b border-base-700 p-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-gray-200">
          Holdings <span className="text-gray-500">({filtered.length})</span>
        </h3>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticker or name…"
              className="w-full rounded-lg border border-base-600 bg-base-800 py-1.5 pl-8 pr-3 text-xs text-gray-200 outline-none focus:border-accent sm:w-48"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setSortOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-lg border border-base-600 bg-base-800 px-3 py-1.5 text-xs text-gray-300 hover:border-base-500"
            >
              <span className="hidden max-w-[110px] truncate sm:inline">{currentSortLabel}</span>
              <span className="sm:hidden">Sort</span>
              <ChevronDown size={13} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-9 z-20 max-h-72 w-56 overflow-y-auto rounded-lg border border-base-600 bg-base-800 py-1 shadow-xl">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortKey(opt.value); setSortOpen(false) }}
                    className={`block w-full px-3 py-1.5 text-left text-xs hover:bg-base-700 ${
                      sortKey === opt.value ? 'text-accent' : 'text-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-h-[560px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-gray-500">
            {metrics.length === 0 ? 'No holdings in this portfolio yet.' : 'No holdings match your search.'}
          </div>
        ) : (
          <ul className="divide-y divide-base-700/70">
            {filtered.map((h) => {
              const isProfit = h.unrealizedPnL >= 0
              const isTodayUp = h.todaysChangePct >= 0
              const isSelected = selectedId === h.id
              return (
                <li
                  key={h.id}
                  onClick={() => onSelect(isSelected ? null : h.id)}
                  className={`group relative cursor-pointer px-4 py-3 transition-colors ${
                    isSelected ? 'bg-accent/10' : 'hover:bg-base-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-100">{h.ticker}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            isTodayUp ? 'bg-profit-bg text-profit' : 'bg-loss-bg text-loss'
                          }`}
                        >
                          {formatPct(h.todaysChangePct)}
                        </span>
                      </div>
                      <p className="truncate text-xs text-gray-500">{h.companyName}</p>
                    </div>
                    <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(h) }}
                        className="rounded p-1 text-gray-500 hover:bg-base-700 hover:text-gray-200"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmRemoveId(h.id) }}
                        className="rounded p-1 text-gray-500 hover:bg-base-700 hover:text-loss"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs sm:grid-cols-4">
                    <Stat label="Qty" value={formatNumber(h.quantity)} />
                    <Stat label="Avg Price" value={formatINR(h.avgPurchasePrice, 2)} />
                    <Stat label="LTP" value={formatINR(h.currentPrice, 2)} />
                    <Stat label="Alloc" value={formatPct(h.allocationPct, 1)} />
                    <Stat label="Invested" value={formatINR(h.investedValue)} />
                    <Stat label="Current" value={formatINR(h.currentValue)} />
                    <Stat
                      label="P&L"
                      value={formatSignedINR(h.unrealizedPnL)}
                      tone={isProfit ? 'profit' : 'loss'}
                    />
                    <Stat
                      label="P&L %"
                      value={formatPct(h.unrealizedReturnPct)}
                      tone={isProfit ? 'profit' : 'loss'}
                    />
                    {h.volume > 0 && (
                      <Stat label="Volume" value={formatCompactVolume(h.volume)} />
                    )}
                  </div>

                  {confirmRemoveId === h.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute inset-0 z-10 flex items-center justify-center gap-3 rounded-lg bg-base-900/95 backdrop-blur-sm"
                    >
                      <span className="text-xs text-gray-300">Remove {h.ticker}?</span>
                      <button
                        onClick={() => setConfirmRemoveId(null)}
                        className="rounded-md border border-base-600 px-2.5 py-1 text-xs text-gray-300 hover:bg-base-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => { onRemove(h); setConfirmRemoveId(null) }}
                        className="rounded-md bg-loss px-2.5 py-1 text-xs font-medium text-white hover:bg-loss-dim"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'profit' | 'loss' }) {
  const toneClass = tone === 'profit' ? 'text-profit' : tone === 'loss' ? 'text-loss' : 'text-gray-300'
  return (
    <div>
      <span className="block text-[10px] text-gray-600">{label}</span>
      <span className={`font-medium ${toneClass}`}>{value}</span>
    </div>
  )
}
