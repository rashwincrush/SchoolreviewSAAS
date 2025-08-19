import React from 'react'
import { Button, Textarea, Input, toast } from '@school-reviews/ui'
import { createSupabaseClient, type TenantSummary, type PublicReview } from '@school-reviews/lib'
import { JsonLd } from './components/JsonLd'

function Stars({ value }: { value: number }) {
  const full = Math.round(value)
  return <span aria-label={`${full} out of 5 stars`}>{'★★★★★'.slice(0, full)}{'☆☆☆☆☆'.slice(0, 5 - full)}</span>
}

function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Rating" style={{ display: 'inline-flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-checked={value === n}
          role="radio"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 20,
          }}
        >
          {n <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
}

export default function App() {
  const supabase = React.useMemo(() => createSupabaseClient(), [])
  // Initialize all state variables at the top (before any effects or callbacks)
  const [tenantSlug, setTenantSlug] = React.useState<string | null>(
    new URLSearchParams(location.search).get('tenant')
  )
  const [summary, setSummary] = React.useState<TenantSummary | null>(null)
  const [items, setItems] = React.useState<PublicReview[]>([])
  const [tenantId, setTenantId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [session, setSession] = React.useState<any>(null)
  const [reviewerId, setReviewerId] = React.useState<string | null>(null)
  const [rating, setRating] = React.useState<number>(5)
  const [text, setText] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [allowedHost, setAllowedHost] = React.useState(true)
  const [allowed, setAllowed] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    if (!tenantSlug) {
      // If no tenant slug, set allowed to false
      setAllowed(false);
      return;
    }
    
    const ref = document.referrer ? new URL(document.referrer).host : location.host
    fetch(`${import.meta.env.VITE_FUNCTIONS_URL}/domains-guard?tenant=${tenantSlug}&host=${encodeURIComponent(ref)}`)
      .then(r => r.json())
      .then(({ allowed }) => setAllowed(allowed))
      .catch(() => setAllowed(true)); // default allow on error (MVP)
  }, [tenantSlug])

  if (allowed === false) {
    return <div style={{maxWidth:720,margin:'2rem auto',fontFamily:'Inter,system-ui'}}>
      <h3>Widget not authorized for this site</h3>
      <p>Please contact the school administrator.</p>
    </div>;
  }
  if (allowed === null) {
    return <div style={{maxWidth:720,margin:'2rem auto',fontFamily:'Inter,system-ui'}}>Loading…</div>;
  }

  // Load public data
  const loadPublic = React.useCallback(async () => {
    if (!tenantSlug) {
      console.error('No tenant slug provided')
      toast('Missing tenant parameter', 'error')
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const url = `${import.meta.env.VITE_FUNCTIONS_URL}/reviews-public?tenant=${encodeURIComponent(tenantSlug)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setSummary(data.summary)
      setItems(data.items ?? [])
      setTenantId(data.tenant_id ?? data.summary?.id ?? null)
    } catch (e) {
      console.error(e)
      toast('Failed to load reviews', 'error')
    } finally {
      setLoading(false)
    }
  }, [tenantSlug])

  React.useEffect(() => {
    loadPublic()
  }, [loadPublic])

  // Session
  React.useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session ?? null)
      supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    }
    init()
  }, [supabase])

  // Upsert reviewer on first logged-in render
  React.useEffect(() => {
    const upsertReviewer = async () => {
      if (!session || !tenantId) return
      const user = session.user
      const provider = 'google'
      const sub = (user.identities?.[0] as any)?.identity_data?.sub || (user.user_metadata as any)?.sub || user.id
      const { data, error } = await supabase
        .from('reviewers')
        .upsert(
          {
            tenant_id: tenantId,
            user_id: user.id,
            oauth_provider: provider,
            oauth_sub: String(sub),
            relation: 'parent',
            verified: true,
          },
          { onConflict: 'tenant_id,oauth_provider,oauth_sub' },
        )
        .select('id')
        .maybeSingle()
      if (error) {
        console.error('upsert reviewer failed', error)
        return
      }
      setReviewerId(data?.id ?? null)
    }
    upsertReviewer()
  }, [session, tenantId, supabase])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } })
  }

  const onSubmit = async () => {
    if (!tenantId || !reviewerId) return toast('Please sign in first', 'error')
    if (!text || text.trim().length < 10) return toast('Review must be at least 10 characters', 'error')
    if (rating < 1 || rating > 5) return toast('Please select a rating', 'error')
    const { data: sess } = await supabase.auth.getSession()
    const token = sess.session?.access_token
    if (!token) return toast('Not authenticated', 'error')
    const res = await fetch(`${import.meta.env.VITE_FUNCTIONS_URL}/reviews-submit`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tenant_id: tenantId, reviewer_id: reviewerId, rating, title, text }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return toast(err.error ?? 'Submit failed', 'error')
    }
    toast('Thanks! Your review is pending approval.', 'success')
    setText('')
    setTitle('')
    setRating(5)
    setTimeout(loadPublic, 800)
  }

  if (!tenantSlug) {
    return <div style={{ padding: 16, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
      <h3>Missing tenant parameter</h3>
      <p>Please add <code>?tenant=your-tenant-slug</code> to the URL.</p>
    </div>
  }

  // Domain guard now handled by the allowed state above

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
      {summary && <JsonLd name={summary.name} avg={summary.avg_rating ?? null} count={summary.review_count} />}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
        {loading ? (
          <p>Loading…</p>
        ) : summary ? (
          <>
            <header style={{ marginBottom: 16 }}>
              <h1 style={{ fontSize: 22, margin: 0 }}>{summary.name}</h1>
              <div style={{ color: '#555' }}>
                {summary.avg_rating != null ? (
                  <>
                    <Stars value={summary.avg_rating} /> ({summary.review_count})
                  </>
                ) : (
                  <span>No ratings yet</span>
                )}
              </div>
            </header>

            <section style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
              {items.length === 0 ? (
                <p>No reviews yet.</p>
              ) : (
                items.map((r) => (
                  <article key={r.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <strong><Stars value={r.rating} /></strong>
                      <time dateTime={r.created_at} style={{ color: '#666', fontSize: 12 }}>
                        {new Date(r.created_at).toLocaleDateString()}
                      </time>
                    </div>
                    {r.body && <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{r.body}</p>}
                  </article>
                ))
              )}
            </section>

            <section>
              {session ? (
                <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: 'block', marginBottom: 6 }}>Your rating</label>
                    <StarInput value={rating} onChange={setRating} />
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: 'block', marginBottom: 6 }}>Title (optional)</label>
                    <Input placeholder="Title (optional)" value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.currentTarget.value)} />
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: 'block', marginBottom: 6 }}>Your review</label>
                    <Textarea rows={4} value={text} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.currentTarget.value)} placeholder="Share your experience…" />
                  </div>
                  <Button onClick={onSubmit}>Submit review</Button>
                </div>
              ) : (
                <Button onClick={signInWithGoogle}>Continue with Google</Button>
              )}
            </section>
          </>
        ) : (
          <p>Tenant not found.</p>
        )}
      </div>
    </div>
  )
}
