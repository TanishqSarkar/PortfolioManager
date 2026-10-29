import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// When not configured, `supabase` is null. Every call site must check
// `isSupabaseConfigured` (or go through AuthContext/PortfolioContext, which
// already do) before using it. The app shows a setup screen instead of
// rendering the rest of the UI when this is false — see App.tsx.
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : (null as unknown as SupabaseClient)
