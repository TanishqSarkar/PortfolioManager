import { ArrowUpRight, ArrowDownRight, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Portfolio, Holding } from '../types'
import { computeHoldingMetrics, portfolioTotals } from '../utils/calculations'
import { formatINR, formatSignedINR, formatPct } from '../utils/format'

interface Props {
  portfolio: Portfolio
  holdings: Holding[]
  onOpen: () => void
  onRename: (name: string) => void
  onDelete: () => void
}

export default function PortfolioCard({ portfolio, holdings, onOpen, onRename, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState(portfolio.name)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const metrics = computeHoldingMetrics(holdings)
  const totals = portfolioTotals(metrics)
  const isPositive = totals.totalPnL >= 0

  function submitRename(e: React.FormEvent) {
    e.preventDefault()
    if (nameDraft.trim()) onRename(nameDraft.trim())
    setRenaming(false)
  }

  return (
    <div className="group relative rounded-2xl border border-base-700 bg-navy-900 p-5 shadow-card transition-all hover:border-base-600 hover:bg-navy-800">
      <div className="mb-4 flex items-start justify-between">
        {renaming ? (
          <form onSubmit={submitRename} className="flex-1 pr-2">
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={submitRename}
              className="w-full rounded-md border border-accent bg-base-800 px-2 py-1 text-base font-semibold text-gray-100 outline-none"
            />
          </form>
        ) : (
          <button onClick={onOpen} className="text-left">
            <h3 className="text-base font-semibold text-gray-100 group-hover:text-white">
              {portfolio.name}
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">{holdings.length} Stocks</p>
          </button>
        )}

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o) }}
            className="rounded-md p-1 text-gray-500 hover:bg-base-700 hover:text-gray-300"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-10 w-40 overflow-hidden rounded-lg border border-base-600 bg-base-800 shadow-xl">
              <button
                onClick={() => { setRenaming(true); setMenuOpen(false) }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-300 hover:bg-base-700"
              >
                <Pencil size={14} /> Rename
              </button>
              <button
                onClick={() => { setConfirmDelete(true); setMenuOpen(false) }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-loss hover:bg-base-700"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <button onClick={onOpen} className="block w-full text-left">
        <div className="space-y-2.5">
          <Row label="Invested Capital" value={formatINR(totals.totalInvested)} />
          <Row label="Current Value" value={formatINR(totals.totalCurrent)} />
          <div className="flex items-center justify-between border-t border-base-700 pt-2.5">
            <span className="text-xs text-gray-500">Total P&amp;L</span>
            <span
              className={`flex items-center gap-1 text-sm font-semibold ${
                isPositive ? 'text-profit' : 'text-loss'
              }`}
            >
              {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {formatSignedINR(totals.totalPnL)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Return</span>
            <span className={`text-sm font-semibold ${isPositive ? 'text-profit' : 'text-loss'}`}>
              {formatPct(totals.totalReturnPct)}
            </span>
          </div>
        </div>
      </button>

      {confirmDelete && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-base-900/95 p-5 text-center backdrop-blur-sm"
        >
          <p className="text-sm text-gray-200">
            Delete <span className="font-semibold">{portfolio.name}</span>? This removes all its holdings.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg border border-base-600 px-4 py-1.5 text-xs text-gray-300 hover:bg-base-700"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="rounded-lg bg-loss px-4 py-1.5 text-xs font-medium text-white hover:bg-loss-dim"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-200">{value}</span>
    </div>
  )
}
