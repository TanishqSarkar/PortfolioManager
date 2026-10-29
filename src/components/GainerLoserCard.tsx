import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react'
import { HoldingMetrics } from '../types'
import { formatINR, formatSignedINR, formatPct, formatNumber } from '../utils/format'

interface Props {
  metrics: HoldingMetrics[]
}

export default function GainerLoserCards({ metrics }: Props) {
  if (metrics.length === 0) return null

  const sorted = [...metrics].sort((a, b) => b.todaysChangePct - a.todaysChangePct)
  const topGainer = sorted[0]
  const topLoser = sorted[sorted.length - 1]

  const allPositive = metrics.every((m) => m.todaysChangePct >= 0)
  const allNegative = metrics.every((m) => m.todaysChangePct <= 0)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <MoverCard
        holding={topGainer}
        kind="gainer"
        label={allPositive && topGainer.id === topLoser.id ? 'Only Mover' : 'Top Gainer'}
        muted={allNegative}
      />
      <MoverCard
        holding={topLoser}
        kind="loser"
        label={allNegative && topGainer.id === topLoser.id ? 'Only Mover' : 'Top Loser'}
        muted={allPositive}
      />
    </div>
  )
}

function MoverCard({
  holding,
  kind,
  label,
  muted,
}: {
  holding: HoldingMetrics
  kind: 'gainer' | 'loser'
  label: string
  muted: boolean
}) {
  const isGainer = kind === 'gainer'
  const changeValue = holding.todaysChangePct
  const textTone = isGainer ? 'text-profit' : 'text-loss'

  return (
    <div
      className={`rounded-2xl border p-5 shadow-card ${
        isGainer ? 'border-profit/25 bg-profit-bg' : 'border-loss/25 bg-loss-bg'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${textTone}`}>
          {isGainer ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {label}
          {muted && <span className="text-gray-500 font-normal">(no {isGainer ? 'gainers' : 'losers'} today)</span>}
        </div>
        <span className={`flex items-center gap-0.5 rounded-md px-2 py-0.5 text-xs font-bold ${textTone}`}>
          {changeValue >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {formatPct(changeValue)}
        </span>
      </div>

      <div className="mb-4">
        <h4 className="text-lg font-bold text-gray-100">{holding.ticker}</h4>
        <p className="text-xs text-gray-500">{holding.companyName}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="block text-gray-600">Current Price</span>
          <span className="font-semibold text-gray-200">{formatINR(holding.currentPrice, 2)}</span>
        </div>
        <div>
          <span className="block text-gray-600">Today's Change</span>
          <span className={`font-semibold ${textTone}`}>
            {formatSignedINR(holding.todaysChangeAbs, 2)}
          </span>
        </div>
        <div>
          <span className="block text-gray-600">Your Quantity</span>
          <span className="font-semibold text-gray-200">{formatNumber(holding.quantity)}</span>
        </div>
        <div>
          <span className="block text-gray-600">Change in Holding Value</span>
          <span className={`font-semibold ${textTone}`}>
            {formatSignedINR(holding.todaysPnLContribution)}
          </span>
        </div>
      </div>
    </div>
  )
}
