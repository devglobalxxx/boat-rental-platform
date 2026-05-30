'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, ChevronDown } from 'lucide-react'

const gold = '#c9a84e'
const muted = 'rgba(244,244,242,0.55)'

export default function AdminVerifyButton({
  userId,
  currentStatus,
}: {
  userId: string
  currentStatus: string
}) {
  const [loading, setLoading] = useState<'verified' | 'rejected' | null>(null)
  const [showRejectNote, setShowRejectNote] = useState(false)
  const [note, setNote] = useState('')
  const router = useRouter()

  async function act(action: 'verified' | 'rejected', notes?: string) {
    setLoading(action)
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, notes }),
    })
    const json = await res.json()
    setLoading(null)
    setShowRejectNote(false)
    if (json.emailTo) {
      const msg = json.emailSent
        ? `✅ Email sent to ${json.emailTo}`
        : `⚠️ Status updated but email failed: ${json.emailError ?? 'unknown'}`
      alert(msg)
    }
    router.refresh()
  }

  if (currentStatus === 'verified') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: 600 }}>✓ Verified</span>
        <button
          onClick={() => act('rejected')}
          disabled={!!loading}
          style={{ fontSize: '11px', color: 'rgba(248,113,113,0.70)', background: 'none', border: '1px solid rgba(248,113,113,0.20)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}
        >
          Revoke
        </button>
      </div>
    )
  }

  if (showRejectNote) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', minWidth: '220px' }}>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Reason for rejection (optional)…"
          rows={2}
          style={{ width: '100%', padding: '8px', borderRadius: '8px', background: '#0a1523', border: '1px solid rgba(248,113,113,0.30)', color: '#f4f4f2', fontSize: '12px', resize: 'vertical', outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => act('rejected', note)}
            disabled={!!loading}
            style={{ padding: '6px 14px', borderRadius: '6px', background: 'rgba(248,113,113,0.14)', border: '1px solid rgba(248,113,113,0.35)', color: '#f87171', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            {loading === 'rejected' ? '…' : 'Reject'}
          </button>
          <button
            onClick={() => setShowRejectNote(false)}
            style={{ padding: '6px 10px', borderRadius: '6px', background: 'transparent', border: '1px solid rgba(255,255,255,0.10)', color: muted, fontSize: '12px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
      <button
        onClick={() => act('verified')}
        disabled={!!loading}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '8px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.30)', color: '#22c55e', fontSize: '12px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
      >
        <CheckCircle style={{ width: 13, height: 13 }} />
        {loading === 'verified' ? '…' : 'Verify'}
      </button>
      <button
        onClick={() => setShowRejectNote(true)}
        disabled={!!loading}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '8px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.22)', color: '#f87171', fontSize: '12px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        <XCircle style={{ width: 13, height: 13 }} />
        Reject
      </button>
    </div>
  )
}
