import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LineChart, LogOut, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePortfolios } from '../context/PortfolioContext'
import PortfolioCard from '../components/PortfolioCard'

export default function PortfolioSelectionPage() {
  const { user, signOut } = useAuth()
  const {
    portfolios,
    isLoading,
    holdingsForPortfolio,
    createPortfolio,
    renamePortfolio,
    deletePortfolio,
  } = usePortfolios()
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    createPortfolio(newName.trim())
    setNewName('')
    setShowCreate(false)
  }

  return (
    <div className="min-h-[calc(100vh-30px)] bg-base-950">
      <header className="sticky top-0 z-20 border-b border-base-700 bg-base-950/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <LineChart className="text-accent" size={22} />
            <span className="text-base font-bold tracking-tight">NSE Portfolio</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-400 sm:inline">{user?.email}</span>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 rounded-lg border border-base-700 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-base-600 hover:text-gray-200"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Your Portfolios</h1>
            <p className="mt-1 text-sm text-gray-500">
              {portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dim"
          >
            <Plus size={16} /> Create Portfolio
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-sm text-gray-500">
            Loading your portfolios…
          </div>
        ) : portfolios.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-base-700 py-24 text-center">
            <LineChart size={36} className="mb-3 text-gray-600" />
            <p className="mb-1 text-sm font-medium text-gray-300">No portfolios yet</p>
            <p className="mb-5 text-xs text-gray-500">Create your first portfolio to start tracking investments.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dim"
            >
              <Plus size={16} /> Create Portfolio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {portfolios.map((p) => (
              <PortfolioCard
                key={p.id}
                portfolio={p}
                holdings={holdingsForPortfolio(p.id)}
                onOpen={() => navigate(`/portfolio/${p.id}`)}
                onRename={(name) => renamePortfolio(p.id, name)}
                onDelete={() => deletePortfolio(p.id)}
              />
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-base-700 bg-navy-900 p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-100">Create Portfolio</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-gray-300">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">Portfolio Name</label>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Retirement Fund"
                className="mb-5 w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2.5 text-sm text-gray-100 outline-none focus:border-accent"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-lg border border-base-600 px-4 py-2 text-sm text-gray-300 hover:bg-base-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dim"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
