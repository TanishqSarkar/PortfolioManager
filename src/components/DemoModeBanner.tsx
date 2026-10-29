import { FlaskConical } from 'lucide-react'

export default function DemoModeBanner() {
  return (
    <div className="flex items-center justify-center gap-2 bg-amber-500/10 border-b border-amber-500/30 py-1.5 px-3 text-xs text-amber-300">
      <FlaskConical size={13} />
      <span>
        Auth &amp; your portfolios are live on Supabase — stock prices are still DEMO/mock data
        until a real market data provider is connected.
      </span>
    </div>
  )
}
