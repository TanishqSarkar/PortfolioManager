import { useState, useMemo } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import {
  LineChart,
  ChevronLeft,
  ChevronDown,
  RefreshCw,
  Plus,
  LogOut,
  User as UserIcon,
  Clock,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePortfolios } from '../context/PortfolioContext'
import { computeHoldingMetrics, portfolioTotals } from '../utils/calculations'
import { Holding, NewHoldingInput } from '../types'
import SummaryCards from '../components/SummaryCards'
import AllocationChart from '../components/AllocationChart'
import HoldingsList from '../components/HoldingsList'
import GainerLoserCards from '../components/GainerLoserCard'
import AddStockModal from '../components/AddStockModal'

export default function DashboardPage() {
  const { portfolioId } = useParams<{ portfolioId: string }>()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const {
    portfolios,
    isLoading,
    holdingsForPortfolio,
    addHolding,
    updateHolding,
    removeHolding,
    refreshPrices,
    lastUpdated,
    isRefreshing,
  } = usePortfolios()

  const [selectedHoldingId, setSelectedHoldingId] = useState<string | null>(null)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null)

  const portfolio = portfolios.find((p) => p.id === portfolioId)
  const holdings = portfolioId ? holdingsForPortfolio(portfolioId) : []
  const metrics = useMemo(() => computeHoldingMetrics(holdings), [holdings])
  const totals = useMemo(() => portfolioTotals(metrics), [metrics])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-base-950 text-gray-400">
        Loading your portfolio…
      </div>
    )
  }

  if (!portfolio) {
    return <Navigate to="/portfolios" replace />
  }

  function openAddModal() {
    setEditingHolding(null)
    setModalOpen(true)
  }

  function openEditModal(holding: Holding) {
    setEditingHolding(holding)
    setModalOpen(true)
  }

  function handleSave(holding: NewHoldingInput, editId?: string) {
    if (editId) {
      updateHolding(editId, holding)
    } else {
      addHolding(holding)
    }
    setModalOpen(false)
  }

  function handleRemove(holding: Holding) {
    removeHolding(holding.id)
    if (selectedHoldingId === holding.id) setSelectedHoldingId(null)
  }

  return (
    <div className="min-h-[calc(100vh-30px)] bg-base-950">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-20 border-b border-base-700 bg-base-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/portfolios')}
              className="flex items-center gap-1 rounded-lg p-1.5 text-gray-500 hover:bg-base-800 hover:text-gray-300"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <LineChart className="text-accent" size={20} />
              <span className="hidden text-sm font-bold tracking-tight sm:inline">NSE Portfolio</span>
            </div>
            <span className="text-gray-700">/</span>

            <div className="relative">
              <button
                onClick={() => setSwitcherOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-lg border border-base-700 bg-navy-800 px-3 py-1.5 text-sm font-medium text-gray-200 hover:border-base-600"
              >
                {portfolio.name}
                <ChevronDown size={14} className="text-gray-500" />
              </button>
              {switcherOpen && (
                <div className="absolute left-0 top-10 z-20 w-56 overflow-hidden rounded-lg border border-base-600 bg-base-800 py-1 shadow-xl">
                  {portfolios.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSwitcherOpen(false)
                        navigate(`/portfolio/${p.id}`)
                      }}
                      className={`block w-full px-3 py-2 text-left text-sm hover:bg-base-700 ${
                        p.id === portfolio.id ? 'text-accent' : 'text-gray-300'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 text-xs text-gray-500 md:flex">
              <Clock size={12} />
              <span>
                Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                DEMO DATA
              </span>
            </div>
            <button
              onClick={refreshPrices}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-lg border border-base-700 px-3 py-1.5 text-xs text-gray-300 hover:border-base-600 disabled:opacity-50"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-dim"
            >
              <Plus size={14} /> Add Stock
            </button>
            <div className="relative">
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center justify-center rounded-full bg-base-800 p-2 text-gray-400 hover:text-gray-200"
              >
                <UserIcon size={15} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-lg border border-base-600 bg-base-800 py-1 shadow-xl">
                  <div className="truncate px-3 py-2 text-xs text-gray-500">{user?.email}</div>
                  <button
                    onClick={signOut}
                    className="flex w-full items-center gap-2 border-t border-base-700 px-3 py-2 text-left text-sm text-loss hover:bg-base-700"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-5 py-6">
        <SummaryCards
          totalInvested={totals.totalInvested}
          totalCurrent={totals.totalCurrent}
          totalPnL={totals.totalPnL}
          totalReturnPct={totals.totalReturnPct}
          todaysChange={totals.todaysChange}
          todaysChangePct={totals.todaysChangePct}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <AllocationChart
              metrics={metrics}
              totalCurrentValue={totals.totalCurrent}
              selectedId={selectedHoldingId}
              onSelect={setSelectedHoldingId}
            />
          </div>
          <div className="lg:col-span-3">
            <HoldingsList
              metrics={metrics}
              selectedId={selectedHoldingId}
              onSelect={setSelectedHoldingId}
              onEdit={openEditModal}
              onRemove={handleRemove}
            />
          </div>
        </div>

        <GainerLoserCards metrics={metrics} />
      </main>

      {modalOpen && (
        <AddStockModal
          portfolioId={portfolio.id}
          editingHolding={editingHolding}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
