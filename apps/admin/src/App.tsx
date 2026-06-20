import React from 'react'
import { Button, toast } from '@school-reviews/ui'
import { createSupabaseClient } from '@school-reviews/lib'
import Home from './pages/Home'
import Campaigns from './pages/Campaigns'

type AdminTab = 'reviews' | 'campaigns'

export default function App() {
  const supabase = React.useMemo(() => createSupabaseClient(), [])

  const [session, setSession] = React.useState<any>(null)
  const [tenantSlug, setTenantSlug] = React.useState<string | null>(null)
  const [tenantId, setTenantId] = React.useState<string | null>(null)
  const [summary, setSummary] = React.useState<any>(null)
  const [pending, setPending] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const [myTenants, setMyTenants] = React.useState<Array<{ tenant_id: string, tenants: { name: string, slug: string } }>>([])
  const [activeTab, setActiveTab] = React.useState<AdminTab>('reviews')

  React.useEffect(() => {
    const slug = new URLSearchParams(location.search).get('tenant')
    setTenantSlug(slug)
  }, [])

  // Auth
  React.useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session ?? null)
      supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    }
    init()
  }, [supabase])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } })
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setSession(null)
      toast('Logged out', 'success')
    } catch (e) {
      toast('Failed to logout', 'error')
    }
  }

  

  // Optional: load tenants where current user is admin
  React.useEffect(() => {
    const loadMyTenants = async () => {
      if (!session?.user?.id) return
      const { data, error } = await supabase
        .from('tenant_admins')
        .select('tenant_id, tenants!inner(name,slug)')
        .eq('user_id', session.user.id)
      if (!error && Array.isArray(data)) setMyTenants(data as any)
    }
    loadMyTenants()
  }, [session, supabase])

  // Resolve tenant via public function and load stats
  const resolveTenant = React.useCallback(async () => {
    if (!tenantSlug) return
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_FUNCTIONS_URL}/reviews-public?tenant=${encodeURIComponent(tenantSlug)}`)
      if (!res.ok) throw new Error('resolve_failed')
      const data = await res.json()
      setTenantId(data.tenant_id ?? data.summary?.id ?? null)
      setSummary(data.summary)
    } catch (e) {
      toast('Unable to resolve tenant', 'error')
    } finally {
      setLoading(false)
    }
  }, [tenantSlug])

  React.useEffect(() => {
    resolveTenant()
  }, [resolveTenant])

  // Load pending reviews
  const loadPending = React.useCallback(async () => {
    if (!tenantId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (error) {
      console.error(error)
      toast('Failed to load pending reviews', 'error')
    } else {
      setPending(data || [])
    }
    setLoading(false)
  }, [tenantId, supabase])

  React.useEffect(() => {
    loadPending()
  }, [loadPending])

  const moderate = async (reviewId: string, action: 'approve' | 'reject') => {
    const { data: sess } = await supabase.auth.getSession()
    const token = sess.session?.access_token
    if (!token) return toast('Not authenticated', 'error')
    const res = await fetch(`${import.meta.env.VITE_FUNCTIONS_URL}/reviews-moderate`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ review_id: reviewId, action }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      if (res.status === 403) return toast('You are not an admin for this tenant', 'error')
      return toast(err.error ?? 'Moderation failed', 'error')
    }
    toast(action === 'approve' ? 'Approved' : 'Rejected', 'success')
    setPending((cur) => cur.filter((r) => r.id !== reviewId))
  }

  if (!session) {
    return <Home />
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
        <header style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <h1 style={{ fontSize: 24, margin: 0 }}>Admin – {summary?.name ?? tenantSlug ?? ''}</h1>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#555', fontSize: 14 }}>{session?.user?.email}</span>
              <Button onClick={signOut}>Logout</Button>
            </div>
          </div>
          {myTenants.length > 0 && (
            <div style={{ margin: '8px 0' }}>
              <label style={{ marginRight: 8 }}>Switch tenant:</label>
              <select
                value={tenantSlug ?? ''}
                onChange={(e) => setTenantSlug(e.currentTarget.value || null)}
                style={{ padding: '6px 8px' }}
              >
                <option value="">Select…</option>
                {myTenants.map((t) => (
                  <option key={t.tenant_id} value={t.tenants.slug}>{t.tenants.name}</option>
                ))}
              </select>
            </div>
          )}
          <div style={{ color: '#555' }}>
            {summary?.avg_rating != null ? (
              <>Avg {summary.avg_rating} ★ • Approved {summary.review_count}</>
            ) : (
              <>No ratings yet</>
            )}
          </div>
        </header>

        {/* Tab navigation */}
        <nav style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e2e8f0', marginBottom: 20 }}>
          {([['reviews', 'Reviews'], ['campaigns', 'Campaigns']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderBottom: activeTab === key ? '2px solid #111' : '2px solid transparent',
                background: 'none',
                cursor: 'pointer',
                fontWeight: activeTab === key ? 600 : 400,
                color: activeTab === key ? '#0f172a' : '#64748b',
                fontSize: 15,
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        {activeTab === 'campaigns' ? (
          <Campaigns />
        ) : (
        <section>
          {loading ? (
            <p>Loading…</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Rating</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Excerpt</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Created</th>
                    <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #eee' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: 12, color: '#666' }}>No pending reviews.</td>
                    </tr>
                  ) : (
                    pending.map((r) => (
                      <tr key={r.id}>
                        <td style={{ padding: 8 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
                        <td style={{ padding: 8 }}>{String(r.body || '').slice(0, 120)}{String(r.body || '').length > 120 ? '…' : ''}</td>
                        <td style={{ padding: 8 }}>{new Date(r.created_at).toLocaleString()}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 8 }}>
                            <Button onClick={() => moderate(r.id, 'approve')}>Approve</Button>
                            <Button onClick={() => moderate(r.id, 'reject')}>Reject</Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
        )}
      </div>
    </div>
  )
}
