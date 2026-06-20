import { createClient } from '@supabase/supabase-js'

export function createSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL as string
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string
  if (!url || !anon) {
    throw new Error(
      'Missing Supabase config. Copy apps/admin/.env.example to apps/admin/.env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    )
  }
  return createClient(url, anon, { auth: { persistSession: true, flowType: 'pkce' } })
}
