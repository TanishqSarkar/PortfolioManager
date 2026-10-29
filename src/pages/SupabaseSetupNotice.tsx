import { AlertTriangle } from 'lucide-react'

export default function SupabaseSetupNotice() {
  return (
    <div className="flex min-h-[calc(100vh-30px)] items-center justify-center bg-base-950 px-4">
      <div className="max-w-md rounded-2xl border border-amber-500/30 bg-amber-500/5 p-7 text-center">
        <AlertTriangle className="mx-auto mb-3 text-amber-400" size={28} />
        <h1 className="mb-2 text-lg font-semibold text-gray-100">Supabase isn't connected yet</h1>
        <p className="mb-4 text-sm text-gray-400">
          This app needs your Supabase project URL and anon key to run. Create a{' '}
          <code className="rounded bg-base-800 px-1.5 py-0.5 text-xs text-gray-300">.env</code>{' '}
          file in the project root (copy{' '}
          <code className="rounded bg-base-800 px-1.5 py-0.5 text-xs text-gray-300">.env.example</code>{' '}
          and fill in your values), then restart{' '}
          <code className="rounded bg-base-800 px-1.5 py-0.5 text-xs text-gray-300">npm run dev</code>.
        </p>
        <p className="text-xs text-gray-600">
          Find these values in your Supabase project under Project Settings → API.
        </p>
      </div>
    </div>
  )
}
