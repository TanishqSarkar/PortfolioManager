import { Wallet, TrendingUp, PieChart, Activity } from 'lucide-react'
import { formatINR, formatSignedINR, formatPct } from '../utils/format'

interface Props {
  totalInvested: number
  totalCurrent: number
  totalPnL: number
  totalReturnPct: number
  todaysChange: number
  todaysChangePct: number
}

export default function SummaryCards({
  totalInvested,
  totalCurrent,
  totalPnL,
  totalReturnPct,
  todaysChange,
  todaysChangePct,
}: Props) {
  const pnlPositive = totalPnL >= 0
  const todayPositive = todaysChange >= 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card
        icon={<Wallet size={16} />}
        label="Total Invested Capital"
        value={formatINR(totalInvested)}
      />
      <Card
        icon={<PieChart size={16} />}
        label="Current Market Value"
        value={formatINR(totalCurrent)}
      />
      <Card
        icon={<TrendingUp size={16} />}
        label="Total Unrealized P&L"
        value={formatSignedINR(totalPnL)}
        sub={formatPct(totalReturnPct)}
        tone={pnlPositive ? 'profit' : 'loss'}
      />
      <Card
        icon={<Activity size={16} />}
        label="Today's Change"
        value={formatSignedINR(todaysChange)}
        sub={formatPct(todaysChangePct)}
        tone={todayPositive ? 'profit' : 'loss'}
      />
    </div>
  )
}

function Card({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  tone?: 'profit' | 'loss'
}) {
  const toneClass = tone === 'profit' ? 'text-profit' : tone === 'loss' ? 'text-loss' : 'text-gray-100'
  return (
    <div className="rounded-2xl border border-base-700 bg-navy-900 p-4 shadow-card">
      <div className="mb-2 flex items-center gap-1.5 text-gray-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-xl font-bold ${toneClass}`}>{value}</span>
        {sub && <span className={`mb-0.5 text-xs font-medium ${toneClass}`}>{sub}</span>}
      </div>
    </div>
  )
}
