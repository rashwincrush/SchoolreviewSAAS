import React from 'react'
import { Button, toast } from '@school-reviews/ui'
import { createSupabaseClient } from '@school-reviews/lib'

export default function Home() {
  const supabase = React.useMemo(() => createSupabaseClient(), [])
  const [session, setSession] = React.useState<any>(null)

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

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      color: '#0f172a',
      backgroundColor: '#ffffff'
    }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #eef2f7' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', boxShadow: '0 2px 10px rgba(79,70,229,.35)' }} />
            <strong style={{ fontSize: 18 }}>School Reviews</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {!session ? (
              <Button onClick={signInWithGoogle}>Continue with Google</Button>
            ) : (
              <>
                <span style={{ color: '#475569', fontSize: 14 }}>{session.user?.email}</span>
                <Button onClick={signOut}>Logout</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(180deg,#f8fafc, #ffffff)',
        borderBottom: '1px solid #eef2f7'
      }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '56px 20px 40px' }}>
          <div style={{ maxWidth: 760 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              borderRadius: 9999,
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff'
            }}>
              <span style={{ fontSize: 12, color: '#0ea5e9' }}>NEW</span>
              <span style={{ fontSize: 12, color: '#475569' }}>Multi-tenant review platform for schools</span>
            </div>
            <h1 style={{ fontSize: 44, lineHeight: 1.1, margin: '16px 0 12px' }}>
              Collect, approve, and showcase real school reviews
            </h1>
            <p style={{ color: '#475569', fontSize: 18, maxWidth: 720 }}>
              An embeddable reviews widget with moderation, powered by Supabase and built for schools. Authenticate with Google, approve high-quality feedback, and display ratings on your site with SEO-friendly markup.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
              {!session ? (
                <Button onClick={signInWithGoogle}>Continue with Google</Button>
              ) : (
                <Button onClick={() => window.location.reload()}>Open Admin Dashboard</Button>
              )}
              <a href="#features" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', color: '#0f172a', textDecoration: 'none'
              }}>Learn more →</a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features">
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 20px' }}>
          <h2 style={{ fontSize: 28, marginBottom: 8 }}>Why School Reviews?</h2>
          <p style={{ color: '#475569', marginBottom: 24 }}>Everything you need to run trustworthy reviews for your school or district.</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16
          }}>
            {[
              { icon: '⭐️', title: 'Showcase Credibility', desc: 'Highlight authentic feedback and increase trust for prospective parents and students.' },
              { icon: '🛡️', title: 'Moderation Built-in', desc: 'Approve or reject submissions before they go live—protect your brand.' },
              { icon: '🔐', title: 'Google Sign‑in', desc: 'Reduce spam and ensure accountability with OAuth-based sign-in.' },
              { icon: '🚀', title: 'SEO Friendly', desc: 'JSON‑LD aggregate ratings for richer search results and better CTR.' },
              { icon: '🏫', title: 'Multi‑tenant', desc: 'Manage multiple schools securely with Postgres RLS isolation.' },
              { icon: '⚙️', title: 'Simple Embed', desc: 'Drop-in iframe or script loader to add reviews anywhere.' }
            ].map((f) => (
              <div key={f.title} style={{
                border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, backgroundColor: '#ffffff'
              }}>
                <div style={{ fontSize: 22 }}>{f.icon}</div>
                <div style={{ fontWeight: 600, marginTop: 8 }}>{f.title}</div>
                <div style={{ color: '#475569', marginTop: 6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #eef2f7', borderBottom: '1px solid #eef2f7' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 20px' }}>
          <h2 style={{ fontSize: 28, marginBottom: 8 }}>How it works</h2>
          <p style={{ color: '#475569', marginBottom: 24 }}>From setup to showcasing reviews in minutes.</p>
          <ol style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
            counterReset: 'step'
          }}>
            {[
              'Create a tenant for your school and allowlist your domain.',
              'Embed the reviews widget on your site via iframe or script.',
              'Parents/students sign in with Google and submit reviews.',
              'Admins approve quality reviews; ratings update automatically.'
            ].map((t) => (
              <li key={t} style={{
                border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, backgroundColor: '#ffffff', listStyle: 'none'
              }}>
                <div style={{ fontSize: 12, color: '#0ea5e9', marginBottom: 6 }}>STEP</div>
                <div style={{ fontWeight: 600 }}>{t}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Final CTA */}
      <section>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, marginBottom: 8 }}>Ready to get started?</h2>
          <p style={{ color: '#475569', marginBottom: 16 }}>Sign in to create your tenant and start collecting reviews.</p>
          {!session ? (
            <Button onClick={signInWithGoogle}>Continue with Google</Button>
          ) : (
            <Button onClick={() => window.location.reload()}>Open Admin Dashboard</Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #eef2f7' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '16px 20px', color: '#64748b', fontSize: 13 }}>
          © {new Date().getFullYear()} School Reviews. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
