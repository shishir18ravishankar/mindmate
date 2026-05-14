import { useState } from 'react'
import { sendConnectionRequest } from '../supabase'
import styles from './FindMatchesTab.module.css'

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  ['#a78bfa', '#7c3aed'],
  ['#f472b6', '#be185d'],
  ['#34d399', '#059669'],
]

function MatchCard({ match, index, currentUserId, status, onStatusChange }) {
  const [bg, fg] = AVATAR_COLORS[index % AVATAR_COLORS.length]
  const [connectErr, setConnectErr] = useState(null)

  async function handleConnect() {
    console.log('[handleConnect] match:', match.name)
    console.log('[handleConnect] currentUserId:', currentUserId)
    console.log('[handleConnect] match.userId:', match.userId)
    if (!match.userId) {
      console.warn('[handleConnect] match.userId is null/undefined — this is a SEED profile, no DB insert will happen')
    }
    onStatusChange(match.name, 'requesting')
    setConnectErr(null)
    try {
      if (match.userId) {
        await sendConnectionRequest(currentUserId, match.userId)
      }
      onStatusChange(match.name, 'requested')
    } catch (err) {
      console.error('[handleConnect] sendConnectionRequest threw:', err)
      setConnectErr(err.message)
      onStatusChange(match.name, null)
    }
  }

  if (status === 'skipped') {
    return (
      <div className={`${styles.card} ${styles.skipped}`}>
        <div className={styles.skippedRow}>
          <span>↩</span>
          <span>{match.name} skipped</span>
          <button className={styles.undoBtn} onClick={() => onStatusChange(match.name, null)}>Undo</button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.avatar} style={{ background: `linear-gradient(135deg, ${bg}, ${fg})` }}>
          {getInitials(match.name)}
        </div>
        <div className={styles.identity}>
          <h3 className={styles.name}>{match.name}</h3>
          <p className={styles.course}>{match.course}</p>
        </div>
        <span className={styles.num}>#{index + 1}</span>
      </div>

      <div className={styles.whyBox}>
        <div className={styles.whyLabel}><span>✦</span> Why you'd click</div>
        <p className={styles.whyText}>{match.why}</p>
      </div>

      <div className={styles.tags}>
        {(match.tags || []).map(t => <span key={t} className={styles.tag}>{t}</span>)}
      </div>

      {connectErr && <p className={styles.cardErr}>{connectErr}</p>}

      {status === 'requested' ? (
        <div className={styles.requestedRow}>
          <span className={styles.requestedBadge}>✓ Request sent</span>
        </div>
      ) : (
        <div className={styles.actions}>
          <button
            className={styles.skipBtn}
            onClick={() => onStatusChange(match.name, 'skipped')}
            disabled={status === 'requesting'}
          >
            Skip
          </button>
          <button
            className={styles.connectBtn}
            onClick={handleConnect}
            disabled={status === 'requesting'}
          >
            {status === 'requesting' ? 'Sending…' : 'Connect ✓'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function FindMatchesTab({ currentUser, matches, loading, error, onFindMatches }) {
  const [statuses, setStatuses] = useState({})

  function setStatus(name, status) {
    setStatuses(s => ({ ...s, [name]: status }))
  }

  // Empty state — not yet run
  if (!loading && !matches && !error) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🧠</div>
        <h2 className={styles.emptyTitle}>Ready to find your people?</h2>
        <p className={styles.emptySub}>
          AI will scan campus profiles and pick 3 you'd genuinely click with.
        </p>
        <button className={styles.findBtn} onClick={onFindMatches}>
          Find my matches →
        </button>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>AI is reading profiles…</p>
      </div>
    )
  }

  // Error
  if (error && !matches) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.errorBanner}>
          <span>⚠</span> {error}
        </div>
        <button className={styles.findBtn} onClick={onFindMatches} style={{ marginTop: 16 }}>
          Try again
        </button>
      </div>
    )
  }

  // Results
  return (
    <div className={styles.results}>
      <div className={styles.resultsHeader}>
        <h2 className={styles.resultsTitle}>Your top matches</h2>
        <button className={styles.rematchBtn} onClick={() => { setStatuses({}); onFindMatches() }}>
          ↺ Find new
        </button>
      </div>

      {error && (
        <div className={styles.errorBanner}><span>⚠</span> {error}</div>
      )}

      <div className={styles.cards}>
        {matches.map((match, i) => (
          <MatchCard
            key={match.name}
            match={match}
            index={i}
            currentUserId={currentUser.id}
            status={statuses[match.name] || null}
            onStatusChange={setStatus}
          />
        ))}
      </div>
    </div>
  )
}
