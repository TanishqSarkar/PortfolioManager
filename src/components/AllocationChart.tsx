import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { HoldingMetrics } from '../types'
import { formatINR, formatPct } from '../utils/format'

interface Props {
  metrics: HoldingMetrics[]
  totalCurrentValue: number
  selectedId: string | null
  onSelect: (id: string | null) => void
}

const PALETTE = [
  '#4f8cff', '#3fb97f', '#e5584f', '#f4b740', '#a855f7',
  '#22d3ee', '#fb923c', '#ec4899', '#84cc16', '#8b5cf6',
  '#14b8a6', '#f43f5e', '#eab308', '#06b6d4', '#6366f1',
]

export default function AllocationChart({ metrics, totalCurrentValue, selectedId, onSelect }: Props) {
  const [viewBy, setViewBy] = useState<'stock' | 'sector'>('stock')

  const sectorsAvailable = useMemo(
    () => metrics.every((m) => !!m.sector),
    [metrics]
  )

  const stockData = useMemo(
    () =>
      metrics
        .slice()
        .sort((a, b) => b.currentValue - a.currentValue)
        .map((m, i) => ({
          id: m.id,
          name: m.ticker,
          fullName: m.companyName,
          value: m.currentValue,
          invested: m.investedValue,
          pct: m.allocationPct,
          color: PALETTE[i % PALETTE.length],
        })),
    [metrics]
  )

  const sectorData = useMemo(() => {
    const bySector = new Map<string, { value: number; invested: number }>()
    metrics.forEach((m) => {
      const key = m.sector || 'Other'
      const existing = bySector.get(key) || { value: 0, invested: 0 }
      bySector.set(key, {
        value: existing.value + m.currentValue,
        invested: existing.invested + m.investedValue,
      })
    })
    return Array.from(bySector.entries())
      .sort((a, b) => b[1].value - a[1].value)
      .map(([name, v], i) => ({
        id: name,
        name,
        fullName: name,
        value: v.value,
        invested: v.invested,
        pct: totalCurrentValue > 0 ? (v.value / totalCurrentValue) * 100 : 0,
        color: PALETTE[i % PALETTE.length],
      }))
  }, [metrics, totalCurrentValue])

  const data = viewBy === 'stock' ? stockData : sectorData

  if (metrics.length === 0) {
    return (
      <div className="flex h-80 flex-col items-center justify-center rounded-2xl border border-base-700 bg-navy-900 text-center">
        <p className="text-sm text-gray-500">No holdings yet — allocation chart will appear here.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-base-700 bg-navy-900 p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200">Portfolio Allocation</h3>
        {sectorsAvailable && (
          <div className="flex gap-1 rounded-lg bg-base-800 p-1 text-xs">
            <button
              onClick={() => setViewBy('stock')}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                viewBy === 'stock' ? 'bg-accent text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              By Stock
            </button>
            <button
              onClick={() => setViewBy('sector')}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                viewBy === 'sector' ? 'bg-accent text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              By Sector
            </button>
          </div>
        )}
      </div>

      <div className="relative h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="90%"
              paddingAngle={1.5}
              stroke="none"
              onClick={(d: any) => {
                if (viewBy === 'stock') {
                  onSelect(selectedId === d.id ? null : d.id)
                }
              }}
            >
              {data.map((entry, i) => (
                <Cell
                  key={entry.id}
                  fill={entry.color}
                  opacity={selectedId && viewBy === 'stock' ? (entry.id === selectedId ? 1 : 0.3) : 1}
                  style={{ cursor: viewBy === 'stock' ? 'pointer' : 'default' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-gray-500">Total Value</span>
          <span className="text-lg font-bold text-gray-100">{formatINR(totalCurrentValue)}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 max-h-28 overflow-y-auto pr-1">
        {data.map((d) => (
          <button
            key={d.id}
            onClick={() => viewBy === 'stock' && onSelect(selectedId === d.id ? null : d.id)}
            className={`flex items-center gap-1.5 text-xs transition-opacity ${
              selectedId && viewBy === 'stock' && d.id !== selectedId ? 'opacity-40' : 'opacity-100'
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-gray-400">{d.name}</span>
            <span className="text-gray-600">{formatPct(d.pct, 1)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-semibold text-gray-100">{d.fullName}</p>
      <p className="text-gray-400">Invested: <span className="text-gray-200">{formatINR(d.invested)}</span></p>
      <p className="text-gray-400">Current: <span className="text-gray-200">{formatINR(d.value)}</span></p>
      <p className="text-gray-400">Allocation: <span className="text-gray-200">{formatPct(d.pct, 1)}</span></p>
    </div>
  )
}
