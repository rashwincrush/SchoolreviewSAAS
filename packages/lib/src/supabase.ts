import { createClient } from '@supabase/supabase-js'

export function createSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL as string
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string
  return createClient(url, anon, { auth: { persistSession: true, flowType: 'pkce' } })
}
