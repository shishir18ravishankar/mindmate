import { useState } from 'react'
import styles from './Matches.module.css'

function getInitials(name) {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const AVATAR_COLORS = [
  ['#a78bfa', '#7c3aed'],
  ['#f472b6', '#be185d'],
  ['#34d399', '#059669'],
]

function MatchCard({ match, index, onAccept, onSkip, status }) {
  const [bg, fg] = AVATAR_COLORS[index % AVATAR_COLORS.length]

  if (status === 'skipped') {
    return (
      <div className={`${styles.card} ${styles.skipped}`}>
        <div className={styles.skippedInner}>
          <span className={styles.skippedIcon}>↩</span>
          <span className={styles.skippedName}>{match.name} skipped</span>
          <button className={styles.undoBtn} onClick={onAccept}>Undo</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.card} ${status === 'accepted' ? styles.accepted : ''}`}>
      {status === 'accepted' && (
        <div className={styles.acceptedBadge}>
          <span>✓</span> Connected!
        </div>
      )}

      <div className={styles.cardTop}>
        <div className={styles.avatar} style={{ background: `linear-gradient(135deg, ${bg}, ${fg})` }}>
          {getInitials(match.name)}
        </div>
        <div className={styles.identity}>
          <h3 className={styles.matchName}>{match.name}</h3>
          <p className={styles.matchCourse}>{match.course}</p>
        </div>
        <div className={styles.matchNum}>#{index + 1}</div>
      </div>

      <div className={styles.whySection}>
        <div className={styles.whyLabel}>
          <span className={styles.sparkle}>✦</span>
          Why you'd click
        </div>
        <p className={styles.whyText}>{match.why}</p>
      </div>

      <div className={styles.tags}>
        {(match.tags || []).map(tag => (
          <span key={tag} className={styles.tag}>{tag}</span>
        ))}
      </div>

      {status !== 'accepted' && (
        <div className={styles.actions}>
          <button className={styles.skipBtn} onClick={onSkip}>Skip</button>
          <button className={styles.acceptBtn} onClick={onAccept}>Connect ✓</button>
        </div>
      )}
    </div>
  )
}

export default function Matches({ matches, userName, onLogout, onRematch, error }) {
  const [statuses, setStatuses] = useState({})

  function setStatus(name, status) {
    setStatuses(s => ({ ...s, [name]: status }))
  }

  const acceptedCount = Object.values(statuses).filter(s => s === 'accepted').length

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.topBar}>
            <div className={styles.logo}>
              <span>🧠</span>
              <span className={styles.logoText}>MindMate</span>
            </div>
            <button className={styles.logoutBtn} onClick={onLogout}>Log out</button>
          </div>

          <h1 className={styles.title}>
            {userName ? `Hey ${userName.split(' ')[0]}, here are your matches` : 'Your top matches'}
          </h1>
          <p className={styles.subtitle}>
            {acceptedCount > 0
              ? `You've connected with ${acceptedCount} ${acceptedCount === 1 ? 'person' : 'people'}!`
              : 'AI picked these 3 based on your profile. Hit Connect to lock one in.'}
          </p>
        </header>

        {error && (
          <div className={styles.errorBanner}>
            <span>⚠</span> {error}
          </div>
        )}

        <div className={styles.cards}>
          {matches.map((match, i) => (
            <MatchCard
              key={match.name}
              match={match}
              index={i}
              status={statuses[match.name] || null}
              onAccept={() => setStatus(match.name, 'accepted')}
              onSkip={() => setStatus(match.name, 'skipped')}
            />
          ))}
        </div>

        <div className={styles.footer}>
          <button className={styles.rematchBtn} onClick={onRematch}>
            ↺ Find new matches
          </button>
        </div>
      </div>
    </div>
  )
}
