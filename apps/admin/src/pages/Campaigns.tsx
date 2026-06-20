import React from 'react'
import { Button, Input } from '@school-reviews/ui'

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type TargetAudience = 'Parents' | 'Students' | 'Alumni' | 'Staff'
type CampaignGoal = 'Admissions trust' | 'General feedback' | 'Event feedback'
type GradeFocus = 'All' | 'KG' | 'Primary' | 'Middle' | '10th' | '12th'

interface CampaignForm {
  name: string
  audience: TargetAudience
  goal: CampaignGoal
  gradeFocus: GradeFocus
  endDate: string
}

const AUDIENCES: TargetAudience[] = ['Parents', 'Students', 'Alumni', 'Staff']
const GOALS: CampaignGoal[] = ['Admissions trust', 'General feedback', 'Event feedback']
const GRADES: GradeFocus[] = ['All', 'KG', 'Primary', 'Middle', '10th', '12th']

const INITIAL_FORM: CampaignForm = {
  name: '',
  audience: 'Parents',
  goal: 'Admissions trust',
  gradeFocus: 'All',
  endDate: '',
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function buildWhatsAppMessage(form: CampaignForm): string {
  const school = 'your school'
  if (form.goal === 'Admissions trust') {
    return (
      `Hi! ${school} is collecting feedback from ${form.audience.toLowerCase()} ` +
      `to help new families learn about our community. We'd love to hear from you! ` +
      `Please share your experience using this link:\n\n` +
      `{{campaign_link}}\n\nThank you!`
    )
  }
  if (form.goal === 'Event feedback') {
    return (
      `Hi! We hope you enjoyed our recent event. ${school} would love your feedback. ` +
      `Please take a moment to share your thoughts:\n\n` +
      `{{campaign_link}}\n\nThank you!`
    )
  }
  return (
    `Hi! ${school} values your opinion. Please share your experience ` +
    `to help us improve:\n\n` +
    `{{campaign_link}}\n\nThank you!`
  )
}

function buildReviewLink(form: CampaignForm): string {
  const slug = form.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `/reviews/campaign/${slug || 'new-campaign'}`
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

const sectionCard: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 20,
  backgroundColor: '#ffffff',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  marginBottom: 4,
  fontSize: 14,
}

const selectStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #ddd',
  outline: 'none',
  width: '100%',
  fontSize: 14,
  backgroundColor: '#fff',
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        padding: 16,
        textAlign: 'center',
        backgroundColor: '#f8fafc',
        minWidth: 120,
        flex: '1 1 120px',
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a' }}>{value}</div>
      <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{label}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function Campaigns() {
  const [form, setForm] = React.useState<CampaignForm>(INITIAL_FORM)
  const [showPreview, setShowPreview] = React.useState(false)

  const update = <K extends keyof CampaignForm>(key: K, value: CampaignForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const canPreview = form.name.trim().length > 0

  const handleGenerate = () => {
    if (canPreview) setShowPreview(true)
  }

  const handleReset = () => {
    setForm(INITIAL_FORM)
    setShowPreview(false)
  }

  const reviewLink = buildReviewLink(form)
  const whatsAppMsg = buildWhatsAppMessage(form)

  return (
    <div>
      {/* Banner */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 20,
          fontSize: 13,
          color: '#1e40af',
        }}
      >
        This is a preview of the Admissions Campaigns feature. Campaign data is not saved and will reset when you leave this page.
      </div>

      <h2 style={{ fontSize: 22, margin: '0 0 16px' }}>Create a Campaign</h2>

      {/* Form */}
      <div style={{ ...sectionCard, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {/* Name */}
          <div>
            <label style={labelStyle}>Campaign name</label>
            <Input
              placeholder="e.g. Admissions 2025"
              value={form.name}
              onChange={(e) => update('name', e.currentTarget.value)}
            />
          </div>

          {/* Audience */}
          <div>
            <label style={labelStyle}>Target audience</label>
            <select
              style={selectStyle}
              value={form.audience}
              onChange={(e) => update('audience', e.currentTarget.value as TargetAudience)}
            >
              {AUDIENCES.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Goal */}
          <div>
            <label style={labelStyle}>Goal</label>
            <select
              style={selectStyle}
              value={form.goal}
              onChange={(e) => update('goal', e.currentTarget.value as CampaignGoal)}
            >
              {GOALS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Grade focus */}
          <div>
            <label style={labelStyle}>Grade focus</label>
            <select
              style={selectStyle}
              value={form.gradeFocus}
              onChange={(e) => update('gradeFocus', e.currentTarget.value as GradeFocus)}
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* End date */}
          <div>
            <label style={labelStyle}>End date (optional)</label>
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) => update('endDate', e.currentTarget.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Button onClick={handleGenerate} disabled={!canPreview}>
            Generate Preview
          </Button>
          <Button
            onClick={handleReset}
            style={{ background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1' }}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Preview section */}
      {showPreview && (
        <>
          <h2 style={{ fontSize: 22, margin: '0 0 16px' }}>Campaign Preview</h2>

          {/* Metrics */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <MetricCard label="Views" value="—" />
            <MetricCard label="Started" value="—" />
            <MetricCard label="Submitted" value="—" />
            <MetricCard label="Approved" value="—" />
          </div>

          {/* Review link */}
          <div style={{ ...sectionCard, marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, margin: '0 0 8px' }}>Review Collection Link</h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 6,
                backgroundColor: '#f1f5f9',
                fontFamily: 'monospace',
                fontSize: 14,
                wordBreak: 'break-all',
              }}
            >
              <span style={{ flex: 1 }}>
                https://reviews.yourschool.com{reviewLink}
              </span>
              <Button
                style={{ flexShrink: 0, padding: '4px 10px', fontSize: 13 }}
                onClick={() => {
                  navigator.clipboard?.writeText(`https://reviews.yourschool.com${reviewLink}`)
                }}
              >
                Copy
              </Button>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 13, color: '#64748b' }}>
              Share this link with {form.audience.toLowerCase()} to collect reviews for this campaign.
            </p>
          </div>

          {/* WhatsApp message */}
          <div style={{ ...sectionCard, marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, margin: '0 0 8px' }}>WhatsApp Message Preview</h3>
            <div
              style={{
                padding: 14,
                borderRadius: 10,
                backgroundColor: '#dcf8c6',
                fontFamily: 'system-ui, sans-serif',
                fontSize: 14,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                maxWidth: 420,
              }}
            >
              {whatsAppMsg.replace('{{campaign_link}}', `https://reviews.yourschool.com${reviewLink}`)}
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 13, color: '#64748b' }}>
              You can customise this message before sharing it with your community.
            </p>
          </div>

          {/* QR code placeholder */}
          <div style={{ ...sectionCard, marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, margin: '0 0 8px' }}>QR Code</h3>
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: 10,
                border: '2px dashed #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                fontSize: 13,
                textAlign: 'center',
                padding: 12,
              }}
            >
              QR code will appear here when the campaign is published
            </div>
          </div>

          {/* Summary */}
          <div style={{ ...sectionCard }}>
            <h3 style={{ fontSize: 16, margin: '0 0 8px' }}>Campaign Summary</h3>
            <table style={{ fontSize: 14 }}>
              <tbody>
                {[
                  ['Name', form.name],
                  ['Audience', form.audience],
                  ['Goal', form.goal],
                  ['Grade focus', form.gradeFocus],
                  ['End date', form.endDate || 'No end date'],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ padding: '4px 16px 4px 0', color: '#64748b' }}>{k}</td>
                    <td style={{ padding: '4px 0', fontWeight: 500 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
