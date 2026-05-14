import { useState, useEffect } from 'react'
import { getIncomingRequests, getSentRequests, updateConnectionStatus } from '../supabase'
import styles from './RequestsTab.module.css'

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = ['#a78bfa', '#f472b6', '#34d399', '#60a5fa', '#fb923c']

function avatarColor(name = '') {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length]
}

const STATUS_META = {
  pending:  { label: 'Pending',   cls: 'statusPending' },
  accepted: { label: 'Accepted ✓', cls: 'statusAccepted' },
  declined: { label: 'Declined',  cls: 'statusDeclined' },
}

// ── Received card ──────────────────────────────────────────────────────────

function ReceivedCard({ request, onAccept, onDecline }) {
  const [actioning, setActioning] = useState(null)
  const p = request.requester
  if (!p) return null

  async function handle(action) {
    setActioning(action)
    try { await (action === 'accept' ? onAccept() : onDecline()) }
    finally { setActioning(null) }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.avatar} style={{ background: avatarColor(p.name) }}>
          {getInitials(p.name)}
        </div>
        <div className={styles.identity}>
          <h3 className={styles.name}>{p.name}</h3>
          <p className={styles.course}>{p.study}</p>
        </div>
      </div>

      {p.free_time && (
        <p className={styles.snippet}>
          <span className={styles.snippetLabel}>Free time </span>
          {p.free_time.length > 110 ? p.free_time.slice(0, 110) + '…' : p.free_time}
        </p>
      )}
      {p.fun_fact && (
        <p className={styles.snippet}>
          <span className={styles.snippetLabel}>Fun fact </span>
          {p.fun_fact}
        </p>
      )}

      <div className={styles.actions}>
        <button
          className={styles.declineBtn}
          onClick={() => handle('decline')}
          disabled={!!actioning}
        >
          {actioning === 'decline' ? 'Declining…' : 'Decline'}
        </button>
        <button
          className={styles.acceptBtn}
          onClick={() => handle('accept')}
          disabled={!!actioning}
        >
          {actioning === 'accept' ? 'Accepting…' : 'Accept ✓'}
        </button>
      </div>
    </div>
  )
}

// ── Sent card ──────────────────────────────────────────────────────────────

function SentCard({ request }) {
  const p = request.recipient
  if (!p) return null

  const meta = STATUS_META[request.status] || STATUS_META.pending

  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.avatar} style={{ background: avatarColor(p.name) }}>
          {getInitials(p.name)}
        </div>
        <div className={styles.identity}>
          <h3 className={styles.name}>{p.name}</h3>
          <p className={styles.course}>{p.study}</p>
        </div>
        <span className={`${styles.statusBadge} ${styles[meta.cls]}`}>
          {meta.label}
        </span>
      </div>

      {p.free_time && (
        <p className={styles.snippet}>
          <span className={styles.snippetLabel}>Free time </span>
          {p.free_time.length > 110 ? p.free_time.slice(0, 110) + '…' : p.free_time}
        </p>
      )}
      {p.fun_fact && (
        <p className={styles.snippet}>
          <span className={styles.snippetLabel}>Fun fact </span>
          {p.fun_fact}
        </p>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function RequestsTab({ currentUser, onCountChange }) {
  const [received, setReceived] = useState([])
  const [sent, setSent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [receivedData, sentData] = await Promise.all([
        getIncomingRequests(currentUser.id),
        getSentRequests(currentUser.id),
      ])
      console.log('[RequestsTab] received:', receivedData.length, '| sent:', sentData.length)
      setReceived(receivedData)
      setSent(sentData)
      onCountChange(receivedData.length)
    } catch (err) {
      console.error('[RequestsTab] load error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAccept(connectionId) {
    await updateConnectionStatus(connectionId, 'accepted')
    const next = received.filter(r => r.id !== connectionId)
    setReceived(next)
    onCountChange(next.length)
  }

  async function handleDecline(connectionId) {
    await updateConnectionStatus(connectionId, 'declined')
    const next = received.filter(r => r.id !== connectionId)
    setReceived(next)
    onCountChange(next.length)
  }

  if (loading) {
    return <div className={styles.center}><div className={styles.spinner} /></div>
  }

  if (error) {
    return (
      <div className={styles.center}>
        <p className={styles.errorText}>⚠ {error}</p>
        <button className={styles.retryBtn} onClick={load}>Retry</button>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Received section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Received</h2>
          <button className={styles.refreshBtn} onClick={load} title="Refresh">↺</button>
          {received.length > 0 && (
            <span className={styles.pendingCount}>{received.length}</span>
          )}
        </div>

        {received.length === 0 ? (
          <div className={styles.sectionEmpty}>
            <span className={styles.sectionEmptyIcon}>📬</span>
            <span>No pending requests</span>
          </div>
        ) : (
          <div className={styles.cards}>
            {received.map(req => (
              <ReceivedCard
                key={req.id}
                request={req}
                onAccept={() => handleAccept(req.id)}
                onDecline={() => handleDecline(req.id)}
              />
            ))}
          </div>
        )}
      </section>

      <div className={styles.divider} />

      {/* Sent section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Sent</h2>
          {sent.length > 0 && (
            <span className={styles.sentCount}>{sent.length}</span>
          )}
        </div>

        {sent.length === 0 ? (
          <div className={styles.sectionEmpty}>
            <span className={styles.sectionEmptyIcon}>📤</span>
            <span>You haven't sent any requests yet</span>
          </div>
        ) : (
          <div className={styles.cards}>
            {sent.map(req => (
              <SentCard key={req.id} request={req} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
